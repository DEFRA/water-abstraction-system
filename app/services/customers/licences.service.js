'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/licences' page
 *
 * @module LicencesService
 */

const LicencesPresenter = require('../../presenters/customers/licences.presenter.js')
const FetchCustomerService = require('./fetch-customer.service.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/licences' page
 *
 * @param {string} customerId - the UUID of the customer
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId) {
  const customer = await FetchCustomerService.go(customerId)

  const pageData = LicencesPresenter.go(customer)

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'licences',
    ...pageData
  }
}

module.exports = {
  go
}
