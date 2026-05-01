'use strict'

/**
 * Fetches the matching notification needed for the view
 * @module FetchNotificationService
 */

const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetches the matching notification needed for the view
 *
 * @param {string} notificationId - The UUID for the notification
 *
 * @returns {Promise<module:NotificationModel>} the matching `NotificationModel` instance
 */
async function go(notificationId) {
  return NotificationModel.query()
    .findById(notificationId)
    .select([
      'createdAt',
      'id',
      'messageRef',
      'messageType',
      'notifyError',
      'notifyStatus',
      'personalisation',
      'plaintext',
      'recipient',
      'status'
    ])
}

module.exports = {
  go
}
