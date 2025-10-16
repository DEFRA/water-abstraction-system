'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 * @module FetchCommunicationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')

const databaseConfig = require('../../../config/database.config.js')

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
  const { results: notifications, total: totalNumber } = await _fetch(licenceRef, page)

  return { notifications, totalNumber }
}

async function _fetch(licenceRef, page) {
  return NotificationModel.query()
    .select(['createdAt', 'id', 'messageType', 'status'])
    .where('licences', '?', licenceRef)
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
    .page(page - 1, databaseConfig.defaultPageSize)
}

module.exports = {
  go
}
