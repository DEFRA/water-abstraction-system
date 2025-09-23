'use strict'

/**
 * Fetches the notifications with the status 'sending'.
 * @module FetchNotificationsService
 */

const NotificationModel = require('../../../models/notification.model.js')
const { today } = require('../../../lib/general.lib.js')

const SEVEN_DAYS = 7

/**
 * Fetches the notifications with the status 'sending'.
 *
 * The function returns a list of 'notifications' that have a status of 'sending' and are less than 7 days old.
 *
 * Notify has a retention period of 7 days, so we only want 'notifications' created within the last 7 days.
 *
 * @param {string | null} eventId - When an event id is provided we check the status only for the event and only for emails.
 *
 * @returns {Promise<object[]>} - an array of 'notifications'
 */
async function go(eventId) {
  const todaysDate = today()
  const sevenDaysAgo = today()

  sevenDaysAgo.setDate(todaysDate.getDate() - SEVEN_DAYS)

  const query = NotificationModel.query()
    .select([
      'createdAt',
      'eventId',
      'id',
      'licenceMonitoringStationId',
      'messageRef',
      'messageType',
      'notifyId',
      'notifyStatus',
      'notify_error',
      'personalisation',
      'status'
    ])
    .where('status', 'pending')
    .andWhere('createdAt', '>=', sevenDaysAgo)

  if (eventId) {
    query.andWhere('eventId', eventId)
    query.andWhere('messageType', 'email')
  }

  return query
}

module.exports = {
  go
}
