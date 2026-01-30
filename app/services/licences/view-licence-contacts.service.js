'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contacts page
 * @module ViewLicenceContactService
 */

const FetchLicenceContactsService = require('./fetch-licence-contacts.service.js')
const LicenceContactsPresenter = require('../../presenters/licences/licence-contacts.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the contact details link page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} The view data for the licence contacts page
 */
async function go(licenceId) {
  const licence = await FetchLicenceContactsService.go(licenceId)

  const pageData = LicenceContactsPresenter.go(licence)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
