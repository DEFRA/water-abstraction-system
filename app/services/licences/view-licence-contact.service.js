'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact page
 * @module ViewLicenceContactService
 */


const FetchLicenceContactService = require('./fetch-licence-contact.service.js')
const LicenceContactPresenter = require('../../presenters/licences/view-licence-contact.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')


/**
 * Orchestrates fetching and presenting the data needed for the licence contact page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence contact details template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  // Licence contact details
  const licenceContacts = await FetchLicenceContactService.go(licenceId)
  const licenceContactsData = LicenceContactPresenter.go(licenceContacts)


  return {
    ...commonData,
    ...licenceContactsData
  }
}

module.exports = {
  go
}
