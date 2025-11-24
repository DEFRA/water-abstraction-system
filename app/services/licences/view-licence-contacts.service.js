'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details tab
 * @module ViewLicenceContactsService
 */

const CustomerContactsPresenter = require('../../presenters/licences/customer-contacts.presenter.js')
const FetchCustomerContactsService = require('./fetch-customer-contacts.service.js')
const FetchLicenceContactsService = require('./fetch-licence-contacts.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const LicenceContactsPresenter = require('../../presenters/licences/licence-contacts.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence contact details template.
 */
async function go(licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)

  const licenceContacts = await FetchLicenceContactsService.go(licenceId)
  const licenceContactsData = LicenceContactsPresenter.go(licenceContacts, licence)

  const customerContacts = await FetchCustomerContactsService.go(licenceId)
  const customerContactsData = CustomerContactsPresenter.go(customerContacts)

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'contact-details',
    ...customerContactsData,
    ...licenceContactsData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
