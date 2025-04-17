'use strict'

/**
 * Fetches the notifications for the `/notifications` page
 * @module FetchEventsNotificationsService
 */

const { ref } = require('objection')

const EventModel = require('../../models/event.model.js')

/**
 * Fetches the notifications for the `/notifications` page
 *
 * @param {object} filter - an object containing the different filters
 *
 * @returns {Promise<object[]>} an array of matching events
 */
async function go(filter) {
  console.log(filter)
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
    const { hasAlert, alerts } = _waterAbstractionAlerts(filter.notifications)
    if (hasAlert) {
      query.where('subtype', 'waterAbstractionAlerts')
      query.whereRaw(`metadata->'options'->'linkages'->0->0->>'alertType' IN (?,?,?,?)`, alerts)
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
 * Various attempts where made to try to get it working passing in a dynamic array but this was the only way to get it
 * to work.
 *
 * @param {object} filter - an object containing the different filters
 *
 * @returns {Promise<string[]>} an array of alert types from the filter
 */
function _waterAbstractionAlerts(filter) {
  const alerts = ['', '', '', '']
  let hasAlert = false

  const {
    waterAbstractionAlertResume,
    waterAbstractionAlertStop,
    waterAbstractionAlertReduce,
    waterAbstractionAlertWarning
  } = filter

  if (waterAbstractionAlertResume) {
    alerts[0] = 'resume'
    hasAlert = true
  }

  if (waterAbstractionAlertStop) {
    alerts[1] = 'stop'
    hasAlert = true
  }

  if (waterAbstractionAlertReduce) {
    alerts[2] = 'reduce'
    hasAlert = true
  }

  if (waterAbstractionAlertWarning) {
    alerts[3] = 'warning'
    hasAlert = true
  }

  return { hasAlert, alerts }
}

module.exports = {
  go
}
