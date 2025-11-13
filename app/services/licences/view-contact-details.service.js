'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the contact details link page
 * @module ViewContactDetailsService
 */

const FetchLicenceContactDetailsService = require('./fetch-licence-contact-details.service.js')
const ContactDetailsPresenter = require('../../presenters/licences/licence-contact-details.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the contact details link page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} The view data for the licence contacts page
 */
async function go(licenceId) {
  const licence = await FetchLicenceContactDetailsService.go(licenceId)

  const pageData = ContactDetailsPresenter.go(licence)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
