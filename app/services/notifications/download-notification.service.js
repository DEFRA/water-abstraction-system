'use strict'

/**
 * Orchestrates fetching and returning the PDF data for a notification
 * @module DownloadNotificationService
 */

const FetchDownloadNotificationService = require('./fetch-notification-download.service.js')

/**
 * Orchestrates fetching and returning the PDF data for a notification
 *
 * @param {string} notificationId - The UUID of the notification
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the saved PDF data
 */
async function go(notificationId) {
  const notificationData = await FetchDownloadNotificationService.go(notificationId)

  return notificationData.pdf
}

module.exports = {
  go
}
