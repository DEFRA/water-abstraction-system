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
 * @param {object} filter - an object containing the different filters to apply to the query
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object[]>} an array of matching notices
 */
async function go(filter, page) {
  const query = EventModel.query()
    .select([
      'id',
      'createdAt',
      'issuer',
      ref('metadata:name').castText().as('name'),
      ref('metadata:options.sendingAlertType').castText().as('alertType'),
      ref('metadata:recipients').castInt().as('recipientCount'),
      ref('metadata:error').castInt().as('errorCount')
    ])
    .where('type', 'notification')
    .whereIn('status', ['sent', 'completed', 'sending'])
    .orderBy('createdAt', 'desc')
    .page(page - 1, DatabaseConfig.defaultPageSize)

  if (filter.sentBy) {
    query.where('issuer', filter.sentBy)
  }

  if (filter.sentFromDay) {
    query.where('createdAt', '>=', new Date(`${filter.sentFromYear}-${filter.sentFromMonth}-${filter.sentFromDay}`))
  }

  if (filter.sentToDay) {
    query.where('createdAt', '<=', new Date(`${filter.sentToYear}-${filter.sentToMonth}-${filter.sentToDay}`))
  }

  if (filter.notifications) {
    const alerts = _waterAbstractionAlerts(filter.notifications)

    if (alerts.length > 0) {
      query.where('subtype', 'waterAbstractionAlerts')
      query.whereRaw(`metadata->'options'->'linkages'->0->0->>'alertType' = ANY (?)`, [alerts])
    }

    if (filter.notifications.legacyNotifications) {
      query.whereIn('subtype', ['hof-stop', 'hof-resume', 'hof-warning'])
    }

    if (filter.notifications.returnsPaperForm) {
      query.where('subtype', 'paperReturnForms')
    }

    if (filter.notifications.returnReminders) {
      query.where('subtype', 'returnReminder')
    }

    if (filter.notifications.returnInvitation) {
      query.where('subtype', 'returnInvitation')
    }
  }

  return query
}

/**
 * Using the provided filter object this function creates an array to be used in the whereRaw clause above.
 * Various attempts were made to try to get it working passing in a dynamic array but this was the only way to get it
 * to work.
 *
 * @param {object} filter - an object containing the different filters
 *
 * @returns {Promise<string[]>} an array of alert types from the filter
 */
function _waterAbstractionAlerts(filter) {
  const alerts = []

  const {
    waterAbstractionAlertResume,
    waterAbstractionAlertStop,
    waterAbstractionAlertReduce,
    waterAbstractionAlertWarning
  } = filter

  if (waterAbstractionAlertResume) {
    alerts.push('resume')
  }

  if (waterAbstractionAlertStop) {
    alerts.push('stop')
  }

  if (waterAbstractionAlertReduce) {
    alerts.push('reduce')
  }

  if (waterAbstractionAlertWarning) {
    alerts.push('warning')
  }

  return alerts
}

module.exports = {
  go
}
