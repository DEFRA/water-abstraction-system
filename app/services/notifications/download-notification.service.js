/**
 * Orchestrates fetching and returning the PDF data for a notification
 * @module DownloadNotificationService
 */

import FetchDownloadNotificationService from './fetch-notification-download.service.js'

/**
 * Orchestrates fetching and returning the PDF data for a notification
 *
 * @param {string} notificationId - The UUID of the notification
 *
 * @returns {Promise<ArrayBuffer>} - Resolves with the saved PDF data
 */
export default async function go(notificationId) {
  const notificationData = await FetchDownloadNotificationService(notificationId)

  return notificationData.pdf
}
