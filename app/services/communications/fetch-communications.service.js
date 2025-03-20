'use strict'

/**
 * Fetches the matching communications and licence data needed for the view
 * @module FetchCommunicationsService
 */

const ScheduledNotificationsModel = require('../../models/scheduled-notification.model.js')

/**
 * Fetches the matching communications and licence data needed for the view
 *
 * @param {string} id - The scheduledNotifications ID
 *
 * @returns {Promise<module:ScheduledNotificationsModel>} the matching `ScheduledNotificationsModel` instance and
 * licence data
 */
async function go(id) {
  const communications = await _fetch(id)

  return communications
}

async function _fetch(id) {
  return ScheduledNotificationsModel.query()
    .findById(id)
    .select(['messageType', 'messageRef', 'personalisation', 'plaintext'])
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select(['createdAt', 'issuer', 'metadata', 'status', 'subtype', 'type'])
    })
}

module.exports = {
  go
}
