'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/billing-accounts' page
 *
 * @module ViewBillingAccountsService
 */

const BillingAccountsPresenter = require('../../presenters/customers/billing-accounts.presenter.js')
const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const FetchCustomerService = require('./fetch-customer.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/billing-accounts' page
 *
 * @param {string} customerId - the UUID of the customer
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId, auth, page) {
  const customer = await FetchCustomerService.go(customerId)

  const { billingAccounts, pagination } = await FetchBillingAccountsService.go(customerId, page)

  const pageData = BillingAccountsPresenter.go(customer, billingAccounts)

  const paginationData = PaginatorPresenter.go(
    pagination.total,
    Number(page),
    `/system/customers/${customerId}/billing-accounts`,
    billingAccounts.length,
    'billing accounts'
  )

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'billing-accounts',
    ...pageData,
    pagination: paginationData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
