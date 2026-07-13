/**
 * Fetches the PDF data for a notification
 * @module FetchDownloadNotificationService
 */

import NotificationModel from '../../models/notification.model.js'

/**
 * Fetches the PDF data for a notification
 *
 * @param {string} notificationId - The UUID for the notifications
 *
 * @returns {Promise<module:NotificationModel>} the PDF for the notification
 */
export default async function (notificationId) {
  return NotificationModel.query().findById(notificationId).select(['pdf'])
}
