'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence page
 *
 * Was built to provide the data needed for the '/licences/{id}' page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page and some elements of the summary tab
 */
async function go (id) {
  const licence = await _fetchLicence(id)

  return licence
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
