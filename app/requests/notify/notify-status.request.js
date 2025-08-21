'use strict'

/**
 * Get the message data for a notification from GOV.UK Notify
 * @module NotifyStatusRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Get the message data for a notification from GOV.UK Notify
 *
 * We use this request as part of determining if a notification has been successfully sent, or if it failed.
 *
 * > See {@link https://docs.notifications.service.gov.uk/rest-api.html#get-message-data | Get message data} for more
 * > details.
 *
 * > Note - You can only get the data for messages sent within the retention period. The default retention period is 7
 * days. We have it set to 90.
 *
 * @param {string} notificationId - The ID of the notification
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(notificationId) {
  const path = `v2/notifications/${notificationId}`

  return NotifyRequest.get(path)
}

module.exports = {
  send
}
