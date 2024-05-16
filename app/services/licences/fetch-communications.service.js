'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/communications` page
 * @module FetchCommunicationsService
 */

const EventModel = require('../../models/event.model.js')
const ScheduledNotificationModel = require('../../models/scheduled-notification.model.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetch the matching licence and return data needed for the view licence communications page
 *
 * Was built to provide the data needed for the '/licences/{id}/communications' page
 *
 * @param {string} licenceId The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's communications tab
 */
async function go (licenceRef, page) {
  const { results, total } = await _fetch(licenceRef, page)

  return { communications: results, pagination: { total } }
}

async function _fetch (licenceRef, page) {
  const data = await ScheduledNotificationModel.query()
    .select([
      'id',
      'messageType'
    ])
    .where('licences', '@>', `["${licenceRef}"]`)
    .whereNotNull('eventId')
    .withGraphFetched('event')
    .modifyGraph('event', (builder) => {
      builder.select([
        'created_at',
        'metadata',
        'type',
        'subtype',
        'status',
        'issuer'
      ]).where('licences', '@>', `["${licenceRef}"]`)
    })
    .page(page - 1, DatabaseConfig.defaultPageSize)

  return data
}

module.exports = {
  go
}
