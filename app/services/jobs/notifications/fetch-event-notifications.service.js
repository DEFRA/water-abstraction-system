'use strict'

/**
 * Fetches the scheduled notifications for events with a status of 'completed' and associated scheduled notifications
 * that have a status of 'sending'.
 * @module FetchEventNotificationsService
 */

const EventModel = require('../../../models/event.model.js')

const SEVEN_DAYS = 7

/**
 * Fetches the scheduled notifications for events with a status of 'completed' and associated scheduled notifications
 * that have a status of 'sending'.
 *
 * The function returns a list of events that are of type 'notification' and whose status is 'completed'. For each event,
 * it includes an array of 'scheduledNotifications' where the status is 'sending'. This status indicates that the initial
 * request has been made to the Notify service, and the system now needs to retrieve the updated notification status.
 *
 * The legacy code may leave many events with statuses like 'processing' or 'processed' and scheduled notifications with
 * a 'draft' status lingering in the database. This fetch focuses on events that are considered completed and relevant
 * for notification reporting purposes.
 *
 * @returns {Promise<object[]>} - an 'event' with an array of 'scheduledNotifications'
 */
async function go() {
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - SEVEN_DAYS)

  return EventModel.query()
    .select('id')
    .whereExists(EventModel.relatedQuery('scheduledNotifications').whereIn('status', ['sending']))
    .andWhere('status', 'completed')
    .andWhere('type', 'notification')
    .andWhere('createdAt', '>=', sevenDaysAgo)
    .withGraphFetched('scheduledNotifications')
    .modifyGraph('scheduledNotifications', (builder) => {
      builder.select(['id', 'notifyId', 'status', 'notifyStatus', 'log']).whereIn('status', ['sending'])
    })
}

module.exports = {
  go
}
