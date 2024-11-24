'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/licence-contact` page
 * @module FetchLicenceContactDetailsService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the licence contact details link page
 *
 * Was built to provide the data needed for the '/licences/{id}/licence-contact' page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the matching `licenceModel` populated with the data needed for the view
 * licence contact details page
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['id', 'licenceRef'])
    .withGraphFetched('licenceDocumentHeader')
    .modifyGraph('licenceDocumentHeader', (builder) => {
      builder.select(['id', 'metadata'])
    })
}

module.exports = {
  go
}
