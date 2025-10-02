'use strict'

/**
 * Fetches the PDF data for a notification
 * @module FetchDownloadNotificationService
 */

const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetches the PDF data for a notification
 *
 * @param {string} notificationId - The UUID for the notifications
 *
 * @returns {Promise<module:NotificationModel>} the PDF for the notification
 */
async function go(notificationId) {
  return NotificationModel.query().findById(notificationId).select(['pdf'])
}

module.exports = {
  go
}
