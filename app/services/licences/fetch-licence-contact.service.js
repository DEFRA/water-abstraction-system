'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/licence-contact` page
 * @module FetchLicenceContactService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the licence contact details link page
 *
 * Was built to provide the data needed for the '/licences/{id}/licence-contact' page
 *
 * @param {string} id The UUID for the licence to fetch
 */

async function go (licenceId) {
  return _fetchLicenceDetails(licenceId)
}

async function _fetchLicenceDetails (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef'
    ])
    .withGraphFetched('licenceDocumentHeader')
    .modifyGraph('licenceDocumentHeader', (builder) => {
      builder.select([
        'id',
        'metadata'
      ])
    })
}

module.exports = {
  go
}
