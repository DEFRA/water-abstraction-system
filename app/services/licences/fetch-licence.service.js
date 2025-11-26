'use strict'

/**
 * Fetches the matching licence for the view '/licences/{id}/*' pages
 * @module FetchLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches the matching licence for the view '/licences/{id}/*' pages
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the matching `LicenceModel`
 */
async function go(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef',
      'revokedDate',
      'lapsedDate',
      'expiredDate',
      'includeInPresrocBilling',
      'includeInSrocBilling'
    ])
    .withGraphFetched('licenceSupplementaryYears')
}

module.exports = {
  go
}
