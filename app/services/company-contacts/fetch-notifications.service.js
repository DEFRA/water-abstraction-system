'use strict'

/**
 * Fetches data needed for the view '/system/company-contacts/{id}/communications' page
 * @module FetchNotificationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')
const { ignoreMessageRef } = require('../../lib/static-lookups.lib.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches data needed for the view '/system/company-contacts/{id}/communications' page
 *
 * @param {string} email - The email of the company contact id
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view company contacts communications
 */
async function go(email, page = '1') {
  const { results: notifications, total: totalNumber } = await _fetch(email, page)

  return { notifications, totalNumber }
}

async function _fetch(email, page) {
  if (!email) {
    return { results: [], total: 0 }
  }

  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageType', 'status'])
    .whereNotNull('recipient')
    .where('recipient', email)
    .whereNotIn('messageRef', ignoreMessageRef)
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
