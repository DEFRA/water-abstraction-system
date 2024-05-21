'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/licence-set-up` page
 * @module FetchChargeVersionsService
 */

const ChargeVersionModel = require('../../models/charge-version.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence set up page
 *
 * Was built to provide the data needed for the '/licences/{id}/licence-set-up' page
 *
 * @param {string} licenceId The string for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's set up tab
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return ChargeVersionModel.query()
    .where('licenceId', licenceId)
    .select([
      'id',
      'startDate',
      'endDate',
      'status',
      'licenceId'
    ])
    .withGraphFetched('changeReason')
    .modifyGraph('changeReason', (builder) => {
      builder.select([
        'description'
      ])
    })
    .orderBy([
      { column: 'startDate', order: 'desc' }
    ])
}

module.exports = {
  go
}
