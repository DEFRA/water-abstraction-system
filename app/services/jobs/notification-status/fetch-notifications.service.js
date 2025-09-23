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
 * @returns {Promise<object[]>} - an array of 'notifications'
 */
async function go() {
  const todaysDate = today()
  const sevenDaysAgo = today()

  sevenDaysAgo.setDate(todaysDate.getDate() - SEVEN_DAYS)

  return NotificationModel.query()
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
}

module.exports = {
  go
}
