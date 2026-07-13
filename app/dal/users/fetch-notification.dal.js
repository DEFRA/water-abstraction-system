/**
 * Fetches the matching notification needed for the view
 * @module FetchNotificationDal
 */

import NotificationModel from '../../models/notification.model.js'

/**
 * Fetches the matching notification needed for the view
 *
 * @param {string} notificationId - The UUID for the notification
 *
 * @returns {Promise<module:NotificationModel>} the matching `NotificationModel` instance
 */
export default async function fetchNotification(notificationId) {
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
