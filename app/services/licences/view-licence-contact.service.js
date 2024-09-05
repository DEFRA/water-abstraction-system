'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details link page
 * @module ViewLicenceContactService
 */

const LicenceContactPresenter = require('../../presenters/licences/licence-contact.presenter.js')
const FetchLicenceContactService = require('./fetch-licence-contact.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details link page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} The view data for the licence contacts page
 */
async function go (licenceId) {
  const licence = await FetchLicenceContactService.go(licenceId)
  const formattedData = await LicenceContactPresenter.go(licence)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
