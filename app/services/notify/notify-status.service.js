'use strict'

/**
 * Get the status of a notifications from GOV.UK Notify
 * @module NotifyStatusService
 */

const NotifyClient = require('notifications-node-client').NotifyClient

const config = require('../../../config/notify.config.js')

/**
 * Get the status of a notifications from GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#get-message-status
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
    return {
      status: error.status,
      message: error.message,
      errors: error.response.data.errors
    }
  }
}

module.exports = {
  go
}
