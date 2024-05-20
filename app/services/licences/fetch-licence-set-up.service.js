'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/licence-set-up` page
 * @module FetchLicenceSetUpService
 */

const ChargeVersionModel = require('../../models/charge-version.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence set up page
 *
 * Was built to provide the data needed for the '/licences/{id}/licence-set-up' page
 *
 * @param {string} licenceRef The string for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's set up tab
 */
async function go (licenceRef) {
  return _fetch(licenceRef)
}

async function _fetch (licenceRef) {
  return ChargeVersionModel.query()
    .where('licenceRef', licenceRef)
    .select([
      'id',
      'startDate',
      'endDate',
      'status'
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
