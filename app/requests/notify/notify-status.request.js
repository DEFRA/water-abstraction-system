'use strict'

/**
 * Get the status of a notification from GOV.UK Notify
 * @module NotifyStatusRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Get the status of a notification from GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#get-message-status
 *
 * > GOV.UK Notify has a retention period of 7 days. Whilst out system should not be checking statuses past this date it
 * is technically possible to receive a status update where notification id does not exist:
 *
 * ```javascript
 * [{
 *  "error": "ValidationError",
 *  "message": "id is not a valid UUID"
 * }]
 * ```
 *
 * https://docs.notifications.service.gov.uk/node.html#get-the-status-of-one-message-error-codes
 *
 * @param {string} notificationId
 *
 * @returns {Promise<object>}
 */
async function send(notificationId) {
  const path = `v2/notifications/${notificationId}`

  return NotifyRequest.get(path)
}

module.exports = {
  send
}
