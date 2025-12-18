'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/billing-accounts' page
 *
 * @module BillingAccountsService
 */

const BillingAccountsPresenter = require('../../presenters/customers/billing-accounts.presenter.js')
const FetchCustomerService = require('./fetch-customer.service.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/billing-accounts' page
 *
 * @param {string} customerId - the UUID of the customer
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId) {
  const customer = await FetchCustomerService.go(customerId)

  const pageData = BillingAccountsPresenter.go(customer)

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'billing-accounts',
    ...pageData
  }
}

module.exports = {
  go
}
