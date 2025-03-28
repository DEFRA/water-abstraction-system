'use strict'

/**
 * Fetches the notifications for the `/notifications` page
 * @module FetchEventsService
 */

const { ref } = require('objection')
const { db } = require('../../../db/db.js')

const EventModel = require('../../models/event.model.js')

/**
 * Fetches the notifications for the `/notifications` page
 *
 * @param {object} filter - an object containing the different filters
 *
 * @returns {Promise<object[]>}
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
    console.log(filter.notifications)
    const alertTypes = _waterAbstractionAlerts(filter.notifications)
    if (alertTypes.length > 0) {
      query.where('subtype', 'waterAbstractionAlerts')
      query.whereRaw(`metadata->'options'->'linkages'->0->0->>'alertType' IN (?,?,?,?)`, alertTypes)
    }

    if (filter.notifications.returnsPaperForm) {
      query.where('subtype', 'paperReturnForms')
    }

    if (filter.notifications.returnsReminders) {
      query.where('subtype', 'returnReminder')
    }

    if (filter.notifications.returnsInvitation) {
      query.where('subtype', 'returnInvitation')
    }
  }

  return query
}

function _waterAbstractionAlerts(filter) {
  console.log(filter)
  const alerts = ['', '', '', '']
  const {
    waterAbstractionAlertResume,
    waterAbstractionAlertStop,
    waterAbstractionAlertReduce,
    waterAbstractionAlertWarning
  } = filter

  if (waterAbstractionAlertResume) {
    alerts[0] = 'resume'
  }

  if (waterAbstractionAlertStop) {
    alerts[1] = 'stop'
  }

  if (waterAbstractionAlertReduce) {
    alerts[2] = 'reduce'
  }

  if (waterAbstractionAlertWarning) {
    alerts[3] = 'warning'
  }

  return alerts
}

module.exports = {
  go
}
