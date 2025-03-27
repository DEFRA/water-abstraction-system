'use strict'

/**
 * Get the status of a notification from GOV.UK Notify
 * @module NotifyStatusService
 */

const NotifyClient = require('notifications-node-client').NotifyClient

const config = require('../../../config/notify.config.js')

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
async function go(notificationId) {
  const notifyClient = new NotifyClient(config.apiKey)

  return _statusById(notifyClient, notificationId)
}

async function _statusById(notifyClient, notificationId) {
  try {
    const response = await notifyClient.getNotificationById(notificationId)

    return {
      status: response.data.status
    }
  } catch (error) {
    const formattedError = {
      status: error.status,
      message: error.message,
      errors: error.response.data.errors
    }

    global.GlobalNotifier.omfg('Notify status update failed', null, formattedError)

    return formattedError
  }
}

module.exports = {
  go
}
