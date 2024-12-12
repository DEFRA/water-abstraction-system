'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 * @module FetchLicenceHistoryService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the licence and related charge, licence and return versions
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['id', 'licenceRef'])
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder.select('id').modify('history')
    })
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder.select('id').modify('history')
    })
    .withGraphFetched('returnVersions')
    .modifyGraph('returnVersions', (builder) => {
      builder.select('id').modify('history')
    })
}

module.exports = {
  go
}
