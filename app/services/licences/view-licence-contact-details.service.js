'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details tab
 * @module ViewLicenceContactDetailsService
 */

const FetchCustomerContactDetailsService = require('./fetch-customer-contacts.service.js')
const FetchLicenceContactsService = require('./fetch-licence-contacts.service.js')
const CustomerContactDetailsPresenter = require('../../presenters/licences/customer-contacts.presenter.js')
const LicenceContactsPresenter = require('../../presenters/licences/licence-contacts.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence contact details template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  // Licence contact details
  const licenceContacts = await FetchLicenceContactsService.go(licenceId)
  const licenceContactsData = LicenceContactsPresenter.go(licenceContacts)

  // Customer contacts
  const customerContacts = await FetchCustomerContactDetailsService.go(licenceId)
  const customerContactsData = CustomerContactDetailsPresenter.go(customerContacts)

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
