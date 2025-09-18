'use strict'

/**
 * Fetches the notices for the `/notices` page
 * @module FetchNoticesService
 */

const { ref } = require('objection')

const EventModel = require('../../models/event.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the notices for the `/notices` page
 *
 * @param {object} filters - an object containing the different filters to apply to the query
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object containing the matching notices and the total count of notices
 */
async function go(filters, page) {
  const query = _fetchQuery()

  _applyFilters(query, filters)

  query.orderBy('createdAt', 'desc').page(page - 1, DatabaseConfig.defaultPageSize)

  return query
}

function _alertNoticeTypes(noticeTypes) {
  const alertTypes = []

  for (const noticeType of noticeTypes) {
    if (['reduce', 'resume', 'stop', 'warning'].includes(noticeType)) {
      alertTypes.push(noticeType)
    }
  }

  return alertTypes
}

function _applyFilters(query, filters) {
  const { fromDate, noticeTypes, reference, sentBy, toDate } = filters

  if (reference) {
    query.whereILike('referenceCode', `%${reference}%`)
  }

  if (sentBy) {
    query.whereILike('issuer', `%${sentBy}%`)
  }

  if (fromDate) {
    query.where('events.createdAt', '>=', new Date(fromDate))
  }

  if (toDate) {
    query.where('events.createdAt', '<=', new Date(toDate))
  }

  _applyNoticeTypeFilters(query, noticeTypes)
}

function _applyNoticeTypeFilters(query, noticeTypes) {
  const alertTypes = _alertNoticeTypes(noticeTypes)
  const standardNoticeTypes = _standardNoticeTypes(noticeTypes)

  // NOTE: If both are selected we have to apply the where clauses in such a way that standard notices without an
  // alert type don't get excluded. To do this, we have to drop down into using `whereRaw()` to query for notices
  // that match either the alert types or the standard notice types
  if (alertTypes.length > 0 && standardNoticeTypes.length > 0) {
    query.whereRaw(
      `((metadata->'options'->>'sendingAlertType' = ANY (?) AND subtype = 'waterAbstractionAlerts') OR subtype = ANY (?))`,
      [alertTypes, standardNoticeTypes]
    )

    return
  }

  if (alertTypes.length > 0) {
    query.whereRaw(`metadata->'options'->>'sendingAlertType' = ANY (?)`, [alertTypes])
    query.where('subtype', 'waterAbstractionAlerts')

    return
  }

  if (standardNoticeTypes.length > 0) {
    query.whereIn('subtype', standardNoticeTypes)
  }
}

function _fetchQuery() {
  return EventModel.query()
    .select([
      'events.id',
      'events.createdAt',
      'events.issuer',
      'events.referenceCode',
      'events.subtype',
      ref('events.metadata:name').castText().as('name'),
      ref('events.metadata:options.sendingAlertType').castText().as('alertType'),
      ref('events.metadata:recipients').castInt().as('recipientCount')
    ])
    .select(
      EventModel.knex().raw(`
        CASE
          WHEN COUNT(*) FILTER (WHERE notifications.status = 'error') > 0 THEN 'error'
          WHEN COUNT(*) FILTER (WHERE notifications.status = 'pending') > 0 THEN 'pending'
          ELSE 'sent'
        END AS overall_status
      `)
    )
    .leftJoin('notifications', 'events.id', 'notifications.eventId')
    .where('events.type', 'notification')
    .whereIn('events.status', ['sent', 'completed', 'sending'])
    .groupBy([
      'events.id',
      'events.createdAt',
      'events.issuer',
      'events.referenceCode',
      'events.subtype',
      'events.metadata'
    ])
}

function _standardNoticeTypes(noticeTypes) {
  const standardTypes = []

  for (const noticeType of noticeTypes) {
    if (noticeType === 'legacyNotifications') {
      standardTypes.push('hof-stop', 'hof-resume', 'hof-warning', 'renewal')

      continue
    }

    if (['paperReturnForms', 'returnInvitation', 'returnReminder'].includes(noticeType)) {
      standardTypes.push(noticeType)
    }
  }

  return standardTypes
}

module.exports = {
  go
}
