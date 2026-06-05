'use strict'

/**
 * Updates the notification record for the new user with the result of sending a notification
 * @module UpdateNotificationDal
 */

/**
 * Updates the notification record for the new user with the result of sending a notification
 *
 * @param {object} notification - The notification model instance to update
 * @param {object} sendResult - The result from sending the notification
 *
 * @returns {Promise<object>} The updated notification record
 */
async function go(notification, sendResult) {
  const { notifyError, notifyId, notifyStatus, plaintext, status } = sendResult

  return notification.$query().patch({ notifyError, notifyId, notifyStatus, plaintext, status })
}

module.exports = {
  go
}
