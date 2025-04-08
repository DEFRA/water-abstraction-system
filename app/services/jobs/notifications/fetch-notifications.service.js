'use strict'

/**
 * Fetches the notifications with the status 'sending'.
 * @module FetchNotificationsService
 */

const NotificationModel = require('../../../models/notification.model.js')

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
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - SEVEN_DAYS)

  return NotificationModel.query()
    .select(['id', 'notifyId', 'status', 'notifyStatus', 'notify_error', 'eventId', 'createdAt'])
    .where('status', 'pending')
    .andWhere('createdAt', '>=', sevenDaysAgo)
}

module.exports = {
  go
}
