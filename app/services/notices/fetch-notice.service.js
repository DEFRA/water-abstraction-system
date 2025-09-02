'use strict'

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 * @module FetchNoticeService
 */

const { ref } = require('objection')

const EventModel = require('../../models/event.model.js')
const NotificationModel = require('../../models/notification.model.js')

const databaseConfig = require('../../../config/database.config.js')

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 *
 * @param {string} noticeId - the UUID of the selected notice
 * @param {number} page - The current page for the pagination service
 * @param {object} filters - an object containing the different filters to apply to the query
 *
 * @returns {Promise<object>} the notice and its associated notifications
 */
async function go(noticeId, page, filters) {
  const notice = await _fetchNotice(noticeId)

  const notificationsQuery = _fetchNotificationsQuery(noticeId)

  _applyFilters(notificationsQuery, filters)

  notificationsQuery
    .orderBy([
      { column: 'rn.recipient_name', order: 'asc' },
      { column: 'notifications.licences', order: 'asc' },
      { column: 'notifications.createdAt', order: 'asc' }
    ])
    .page(page - 1, databaseConfig.defaultPageSize)

  const { results: notifications, total: totalNumber } = await notificationsQuery

  return {
    notice,
    notifications,
    totalNumber
  }
}

function _applyFilters(query, filters) {
  const { status, licence, recipient } = filters

  if (recipient) {
    query.whereILike('rn.recipient_name', `%${recipient}%`)
  }

  if (status) {
    query.where('notifications.status', '=', status)
  }

  if (licence) {
    query.where('notifications.licences', '?', licence)
  }
}

async function _fetchNotice(noticeId) {
  return EventModel.query()
    .findById(noticeId)
    .select([
      'createdAt',
      'id',
      'issuer',
      'referenceCode',
      'status',
      'subtype',
      ref('metadata:options.sendingAlertType').castText().as('alertType'),
      'es.error_count',
      'es.pending_count'
    ])
    .joinRaw(
      `
      INNER JOIN (
        SELECT
          n.event_id,
          COUNT(*) FILTER (WHERE n.status = 'error') AS error_count,
          COUNT(*) FILTER (WHERE n.status = 'pending') AS pending_count
        FROM
          public.notifications n
        WHERE n.event_id = ?
        GROUP BY n.event_id
      ) es ON es.event_id = events.id
      `,
      [noticeId]
    )
}

function _fetchNotificationsQuery(noticeId) {
  return NotificationModel.query()
    .select([
      'notifications.id',
      'rn.recipient_name',
      'notifications.licences',
      'notifications.messageType',
      'notifications.notifyStatus',
      'notifications.personalisation',
      'notifications.status'
    ])
    .joinRaw(
      `
      INNER JOIN (
        SELECT
          rn.id,
          (CASE
            WHEN rn.message_type = 'email' THEN rn.recipient
            ELSE rn.personalisation->>'address_line_1'
          END) AS recipient_name
        FROM
          public.notifications rn
        WHERE
          rn.event_id = ?
      ) rn ON rn.id = notifications.id
      `,
      [noticeId]
    )
    .where('event_id', noticeId)
}

module.exports = {
  go
}
