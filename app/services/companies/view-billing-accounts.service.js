'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/billing-accounts' page
 *
 * @module ViewBillingAccountsService
 */

const BillingAccountsPresenter = require('../../presenters/companies/billing-accounts.presenter.js')
const FetchBillingAccountsService = require('./fetch-billing-accounts.service.js')
const FetchCompanyService = require('./fetch-company.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/billing-accounts' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, auth, page) {
  const company = await FetchCompanyService.go(companyId)

  const { billingAccounts, pagination } = await FetchBillingAccountsService.go(companyId, page)

  const pageData = BillingAccountsPresenter.go(company, billingAccounts)

  const paginationData = PaginatorPresenter.go(
    pagination.total,
    Number(page),
    `/system/companies/${companyId}/billing-accounts`,
    billingAccounts.length,
    'billing accounts'
  )

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'billing-accounts',
    pagination: paginationData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
