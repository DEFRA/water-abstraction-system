'use strict'

/**
 * Fetches the matching notification and licence data needed for the view
 * @module FetchDownloadNotificationService
 */

const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetches the matching notification and licence data needed for the view
 *
 * @param {string} notificationId - The UUID for the notifications
 *
 * @returns {Promise<module:NotificationModel>} the matching `NotificationModel` instance and
 * licence data
 */
async function go(notificationId) {
  return NotificationModel.query().findById(notificationId).select(['pdf'])
}

module.exports = {
  go
}
