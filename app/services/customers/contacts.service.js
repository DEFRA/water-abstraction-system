'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @module ContactsService
 */

const ContactsPresenter = require('../../presenters/customers/contacts.presenter.js')
const FetchContactsService = require('./fetch-company-contacts.service.js')
const FetchCustomerService = require('./fetch-customer.service.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @param {string} customerId - the UUID of the customer
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId, auth) {
  const customer = await FetchCustomerService.go(customerId)

  const contacts = await FetchContactsService.go(customerId)

  const pageData = ContactsPresenter.go(customer, auth, contacts)

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'contacts',
    ...pageData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
