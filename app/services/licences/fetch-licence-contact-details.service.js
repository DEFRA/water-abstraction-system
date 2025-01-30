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
    .withGraphFetched('licenceDocumentHeader.licenceEntityRole')
    .modifyGraph('licenceDocumentHeader.licenceEntityRole', (builder) => {
      builder.select(['role']).whereIn('role', ['primary_user', 'user_returns'])
    })
    .withGraphFetched('licenceDocumentHeader.licenceEntityRole.licenceEntity')
    .modifyGraph('licenceDocumentHeader.licenceEntityRole.licenceEntity', (builder) => {
      builder.select(['name'])
    })
}

module.exports = {
  go
}
