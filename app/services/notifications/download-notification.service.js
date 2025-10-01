'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view notification page
 * @module DownloadNotificationService
 */

const FetchDownloadNotificationService = require('./fetch-notification-download.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the view notification page
 *
 * @param {string} notificationId - The UUID of the notification
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view notification template.
 */
async function go(notificationId) {
  const notificationData = await FetchDownloadNotificationService.go(notificationId)

  return notificationData.pdf
}

module.exports = {
  go
}
