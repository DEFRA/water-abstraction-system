'use strict'

/**
 * Fetches data needed for the view '/system/users/internal/{id}/communications' page
 * @module FetchNotificationsDal
 */

const NotificationModel = require('../../../models/notification.model.js')

const DatabaseConfig = require('../../../../config/database.config.js')

/**
 * Fetches data needed for the view '/system/users/internal/{id}/communications' page
 *
 * @param {string} username - The username (email) of the user
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object[]>} the notifications linked to the user
 */
async function go(username, page = '1') {
  const { results: notifications, total: totalNumber } = await _fetch(username, page)

  return { notifications, totalNumber }
}

async function _fetch(username, page) {
  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageRef', 'messageType', 'status'])
    .whereNull('eventId')
    .where('recipient', username)
    .orderBy('createdAt', 'DESC')
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
