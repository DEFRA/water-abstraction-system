'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details tab
 * @module ViewLicenceContactsService
 */

const CustomerContactsPresenter = require('../../presenters/licences/customer-contacts.presenter.js')
const FetchCustomerContactsService = require('./fetch-customer-contacts.service.js')
const FetchLicenceContactsService = require('./fetch-licence-contacts.service.js')
const LicenceContactsPresenter = require('../../presenters/licences/licence-contacts.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence contact details template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  // Licence contact details
  const licenceContacts = await FetchLicenceContactsService.go(licenceId)
  const licenceContactsData = LicenceContactsPresenter.go(licenceContacts)

  // Customer contacts details
  const customerContacts = await FetchCustomerContactsService.go(licenceId)
  const customerContactsData = CustomerContactsPresenter.go(customerContacts)

  return {
    activeTab: 'contact-details',
    ...commonData,
    ...customerContactsData,
    ...licenceContactsData
  }
}

module.exports = {
  go
}
