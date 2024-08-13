'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details link page
 * @module ViewLicenceContactService
 */

const LicenceContactPresenter = require('../../presenters/licences/licence-contact.presenter.js')
const LicenceModel = require('../../models/licence.model.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details link page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} The view data for the licence contacts page
 */
async function go (licenceId) {
  const licence = await _fetchLicenceDetails(licenceId)

  const formattedData = await LicenceContactPresenter.go(licence)

  return {
    activeNavBar: 'search',
    pageTitle: 'Licence contact details',
    ...formattedData
  }
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
