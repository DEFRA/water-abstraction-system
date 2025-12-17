'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @module ContactsService
 */

const ContactsPresenter = require('../../presenters/customers/contacts.presenter.js')
const FetchCustomerService = require('./fetch-customer.service.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @param {string} customerId - the UUID of the customer
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId) {
  const customer = await FetchCustomerService.go(customerId)

  const pageData = ContactsPresenter.go(customer)

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'contacts',
    ...pageData
  }
}

module.exports = {
  go
}
