'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 * @module FetchCommunicationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 *
 * @param {string} licenceRef - The licence ref for the licence
 * @param {string} page - The current page for the pagination service
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
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
