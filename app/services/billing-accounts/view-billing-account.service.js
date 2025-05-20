'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view billing account page
 * @module ViewBillingAccountService
 */

const FetchViewBillingAccountService = require('../billing-accounts/fetch-view-billing-account.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewBillingAccountPresenter = require('../../presenters/billing-account/view-billing-account.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view billing account page
 *
 * @param {string} id - The UUID of the billing account to view
 * @param {string|undefined} licenceId - The UUID of the licence related to the billing account, if available, used to
 * determine the backlink
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view billing account template.
 */
async function go(id, licenceId, page) {
  const billingAccountData = await FetchViewBillingAccountService.go(id, page)

  const pageData = ViewBillingAccountPresenter.go(billingAccountData, licenceId)

  const pagination = PaginatorPresenter.go(pageData.pagination.total, Number(page), `/system/billing-accounts/${id}`)

  return {
    activeNavBar: 'search',
    ...pageData,
    pagination
  }
}

module.exports = {
  go
}
