'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 * @module FetchCommunicationsService
 */

const NotificationModel = require('../../models/notification.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetch the matching licence and return data needed for the view licence communications page
 *
 * Was built to provide the data needed for the '/licences/{id}/communications' page
 *
 * @param {string} licenceRef - The reference for the licence to fetch
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's communications tab
 */
async function go(licenceRef, page) {
  const { results, total } = await _fetch(licenceRef, page)

  return { communications: results, pagination: { total } }
}

async function _fetch(licenceRef, page) {
  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageType', 'messageRef'])
    .where('licences', '?', licenceRef)
    .where('status', 'sent')
    .whereNotNull('eventId')
    .orderBy('notifications.created_at', 'DESC')
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select(['issuer', 'metadata', 'status', 'subtype', 'type'])
    })
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
