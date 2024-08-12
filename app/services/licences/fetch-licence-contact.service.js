'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/licence-contact` page
 * @module FetchLicenceContactService
 */

const LicenceDocumentHeaderModel = require('../../models/licence-document-header.model.js')

/**
 * Fetch the matching licence and return data needed for the licence contact details link page
 *
 * Was built to provide the data needed for the '/licences/{id}/licence-contact' page
 *
 * @param {string} id The UUID for the licence to fetch
 */
async function go (id) {
  const licenceData = await _fetchLicenceDetails(id)

  return licenceData
}

async function _fetchLicenceDetails (id) {
  const result = await LicenceDocumentHeaderModel.query()
    .findById(id)
    .select([
      'licenceRef',
      'metadata',
      'licenceName'
    ])

  return result
}

module.exports = {
  go
}
