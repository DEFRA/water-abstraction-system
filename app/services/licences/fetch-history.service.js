'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 * @module FetchHistoryService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches data needed for the view '/licences/{id}/history` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the licence and licence versions
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['id'])
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder.select(['endDate', 'id', 'startDate'])
    })
}

module.exports = {
  go
}
