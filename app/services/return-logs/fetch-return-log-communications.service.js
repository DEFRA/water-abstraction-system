'use strict'

/**
 * Fetches data needed for the view '/return-logs/{id}` page
 * @module FetchReturnLogCommunicationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetches data needed for the view '/return-logs/{id}` page
 *
 * @param {string} returnId - The licence ref for the licence
 *
 * @returns {Promise<object>} the data needed to populate the view return log page's communications tab
 */
async function go(returnId) {
  console.log(returnId)
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
