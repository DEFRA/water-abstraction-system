'use strict'

/**
 * Fetches data needed for the bill run page which includes a summary for each bill linked to the bill run
 * @module FetchLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the licence data from the water schema
 *
 * Was built to provide the data needed for the '/licences/{id}' page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Object} the data needed to populate the summary page
 */
async function go (id) {
  const licence = await _fetchLicence(id)

  return {
    licence
  }
}

async function _fetchLicence (id) {
  const result = LicenceModel.query()
    .findById(id)
    .select([
      'expiredDate',
      'id',
      'lapsedDate',
      'licenceRef',
      'revokedDate',
      'startDate'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })

  return result
}

module.exports = {
  go
}
