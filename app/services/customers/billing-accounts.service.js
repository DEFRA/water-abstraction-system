'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/billing-accounts' page
 *
 * @module BillingAccountsService
 */

const BillingAccountsPresenter = require('../../presenters/customers/billing-accounts.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/billing-accounts' page
 *
 * @param {string} _customerId - the UUID of the customer
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(_customerId) {
  const pageData = BillingAccountsPresenter.go()

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'billing-accounts',
    ...pageData
  }
}

module.exports = {
  go
}
