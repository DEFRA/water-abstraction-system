'use strict'

/**
 * Get the statuses of notifications by unique reference from GOV.UK Notify
 * @module NotifyStatusesRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * Get the statuses of notifications by unique reference from GOV.UK Notify
 *
 * https://docs.notifications.service.gov.uk/node.html#get-the-status-of-multiple-messages
 *
 * @param {string | null} olderThanNotificationId - the client returns the next 250 received notifications older than
 * the given id
 * @param {string} referenceCode - This reference identifies a single unique notification or a batch of notifications
 *
 * @returns {Promise<object>}
 */
async function send(olderThanNotificationId, referenceCode) {
  const path = `v2/notifications?reference=${referenceCode}&older_than=${olderThanNotificationId}`

  return NotifyRequest.get(path)
}

module.exports = {
  send
}
