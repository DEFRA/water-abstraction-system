'use strict'

/**
 * Fetches data needed for the view '/system/return-logs/{id}/communications' page
 * @module FetchNotificationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches data needed for the view '/system/return-logs/{id}/communications' page
 *
 * @param {string} returnLogId - The UUID of the return log
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object[]>} the notifications linked to the return log
 */
async function go(returnLogId, page = '1') {
  const { results: notifications, total: totalNumber } = await _fetch(returnLogId, page)

  return { notifications, totalNumber }
}

async function _fetch(returnLogId, page) {
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
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
