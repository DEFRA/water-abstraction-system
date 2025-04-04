'use strict'

/**
 * Fetches the scheduled notifications with the status 'sending'.
 * @module FetchScheduledNotificationsService
 */

const ScheduledNotificationModel = require('../../../models/scheduled-notification.model.js')

const SEVEN_DAYS = 7

/**
 * Fetches the scheduled notifications with the status 'sending'.
 *
 * The function returns a list of 'scheduledNotifications' that have a status of 'sending' and are less than 7 days old.
 *
 * Notify has a retention period of 7 days, so we only want 'scheduledNotifications' created within the last 7 days.
 *
 * @returns {Promise<object[]>} - an array of 'scheduledNotifications'
 */
async function go() {
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - SEVEN_DAYS)

  return ScheduledNotificationModel.query()
    .select(['id', 'notifyId', 'status', 'notifyStatus', 'log', 'eventId', 'createdAt'])
    .where('status', 'pending')
    .andWhere('createdAt', '>=', sevenDaysAgo)
}

module.exports = {
  go
}
