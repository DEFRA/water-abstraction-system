'use strict'

/**
 * Fetches the matching licence and its data needed for the view '/licences/{id}/*` pages
 * @module FetchLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches the matching licence and its data needed for the view '/licences/{id}/*` pages
 *
 * Was built to provide the data needed for the '/licences/{id}' page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the matching `LicenceModel` populated with the data needed for the view
 * licence page top section (shared by all tab pages) and some elements needed for the summary tab
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'expiredDate',
      'lapsedDate',
      'includeInPresrocBilling',
      'includeInSrocBilling',
      'licenceRef',
      'revokedDate'
    ])
    .modify('licenceName')
    .modify('primaryUser')
    .withGraphFetched('licenceSupplementaryYears')
    .modifyGraph('licenceSupplementaryYears', (builder) => {
      builder
        .select([
          'id',
          'licenceId',
          'billRunId',
          'financialYearEnd',
          'twoPartTariff'
        ])
    })
    .withGraphFetched('workflows')
    .modifyGraph('workflows', (builder) => {
      builder
        .select([
          'id',
          'status'
        ])
        .whereNull('deletedAt')
    })
}

module.exports = {
  go
}
