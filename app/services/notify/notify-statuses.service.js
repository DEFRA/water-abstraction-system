'use strict'

/**
 * Get the statuses of a notification by unique reference from GOV.UK Notify
 * @module NotifyStatusesService
 */

const NotifyClient = require('notifications-node-client').NotifyClient

const config = require('../../../config/notify.config.js')

/**
 * Get the statuses of a notification by unique reference from GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#get-the-status-of-multiple-messages
 *
 * @param {string|null} olderThanNotificationId - the client returns the next 250 received notifications older than
 * the given id
 * @param {string} referenceCode - This reference identifies a single unique notification or a batch of notifications
 *
 * @returns {Promise<object>}
 */
async function go(olderThanNotificationId = null, referenceCode) {
  const notifyClient = new NotifyClient(config.apiKey)

  return _statuses(notifyClient, olderThanNotificationId, referenceCode)
}

async function _statuses(notifyClient, olderThanNotificationId, referenceCode) {
  try {
    const templateType = null
    const status = null

    const response = await notifyClient.getNotifications(templateType, status, referenceCode, olderThanNotificationId)

    return {
      data: response.data.notifications
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
