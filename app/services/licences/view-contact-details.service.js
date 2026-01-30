'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view contact details page
 * @module ViewContactDetailsService
 */

const CompanyContactsPresenter = require('../../presenters/licences/company-contacts.presenter.js')
const ContactDetailsPresenter = require('../../presenters/licences/contact-details.presenter.js')
const FetchContactDetailsService = require('./fetch-contact-details.service.js')
const FetchCustomerContactsService = require('./fetch-company-contacts.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
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

  const licenceContacts = await FetchContactDetailsService.go(licenceId)
  const licenceContactsData = ContactDetailsPresenter.go(licenceContacts, licence)

  const companyContacts = await FetchCustomerContactsService.go(licenceId)
  const companyContactsData = CompanyContactsPresenter.go(companyContacts)

  return {
    activeSecondaryNav: 'contact-details',
    ...companyContactsData,
    ...licenceContactsData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
