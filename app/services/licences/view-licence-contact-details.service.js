'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details link page
 * @module ViewLicenceContactDetailsService
 */

const ViewLicenceContactDetailsPresenter = require('../../presenters/licences/view-licence-contact-details.presenter.js')
const FetchLicenceContactDetailsService = require('./fetch-licence-contact-details.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details link page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} The view data for the licence contacts page
 */
async function go(licenceId) {
  const licence = await FetchLicenceContactDetailsService.go(licenceId)
  const formattedData = await ViewLicenceContactDetailsPresenter.go(licence)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
