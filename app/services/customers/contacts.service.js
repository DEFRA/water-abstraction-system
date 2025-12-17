'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @module ContactsService
 */

const ContactsPresenter = require('../../presenters/customers/contacts.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @param {string} _customerId - the UUID of the customer
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(_customerId) {
  const pageData = ContactsPresenter.go()

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'contacts',
    ...pageData
  }
}

module.exports = {
  go
}
