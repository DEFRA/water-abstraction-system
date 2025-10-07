'use strict'

/**
 * Fetch notifications for a notice
 * @module FetchNotificationsService
 */

const NotificationModel = require('../../../../app/models/notification.model.js')

/**
 * Fetch notifications for a notice
 *
 * The legacy code used a table called 'events' which groups all the notifications together. This is why we pass in the
 * eventId as this relates to the 'event_id' column.
 *
 * @param {string} eventId - the unique id used to group all the notifications together
 *
 * @returns {object} - the notifications for the event
 */
async function go(eventId) {
  return NotificationModel.query()
    .select(['id', 'messageRef', 'messageType', 'pdf', 'personalisation', 'recipient', 'return_log_ids', 'templateId'])
    .where('eventId', eventId)
}

module.exports = {
  go
}
