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
 * @param {string} returnId - The licence ref for the licence
 *
 * @returns {Promise<object[]>} the notifications linked to the return log
 */
async function go(returnId) {
  const results = await _fetch(returnId)

  return results
}

async function _fetch(returnId) {
  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageType', 'status'])
    .where('returnLogIds', '?', returnId)
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
