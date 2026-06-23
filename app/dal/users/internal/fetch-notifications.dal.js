'use strict'

/**
 * Fetches data needed for the view '/system/users/internal/{id}/communications' page
 * @module FetchNotificationsDal
 */

const NotificationModel = require('../../../models/notification.model.js')
const { userNotificationTypes } = require('../../../lib/static-lookups.lib.js')

const DatabaseConfig = require('../../../../config/database.config.js')
const ServerConfig = require('../../../../config/server.config.js')

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
    .whereIn('messageRef', _messageRefs())
    .whereRaw(
      `(
  notifications.personalisation->>'reset_url' IS NULL
  OR notifications.personalisation->>'reset_url' LIKE '${ServerConfig.domains.internal}%'
)`
    )
    .orderBy([
      { column: 'createdAt', order: 'desc' },
      { column: 'messageType', order: 'asc' },
      { column: 'status', order: 'asc' },
      { column: 'id', order: 'asc' }
    ])
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

function _messageRefs() {
  const messageRefs = []

  for (const [key, value] of Object.entries(userNotificationTypes)) {
    if (['both', 'internal'].includes(value.type)) {
      messageRefs.push(key)
    }
  }

  return messageRefs
}

module.exports = {
  go
}
