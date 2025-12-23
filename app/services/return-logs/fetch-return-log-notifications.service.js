'use strict'

/**
 * Fetch notifications linked to a specified return log
 * @module FetchReturnLogNotificationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetch notifications linked to a specified return log
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<object[]>} the notifications linked to the return log
 */
async function go(returnLogId) {
  const results = await _fetch(returnLogId)

  return results
}

async function _fetch(returnLogId) {
  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageType', 'status'])
    .where('returnLogIds', '?', returnLogId)
    .orderBy('createdAt', 'DESC')
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select([
        'id',
        'issuer',
        'subtype',
        ref('metadata:options.sendingAlertType').castText().as('sendingAlertType')
      ])
    })
}

module.exports = {
  go
}
