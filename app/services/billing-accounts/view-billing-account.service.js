'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view billing account page
 * @module ViewBillingAccountService
 */

const FetchViewBillingAccountService = require('../billing-accounts/fetch-view-billing-account.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewBillingAccountPresenter = require('../../presenters/billing-accounts/view-billing-account.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view billing account page
 *
 * @param {string} id - The UUID of the billing account to view
 * @param {number|string} page - The current page for the pagination service
 * @param {string|undefined} licenceId - The UUID of the licence related to the billing account, if available, used to
 * determine the backlink
 * @param {string|undefined} chargeVersionId - The UUID of the charge version related to the billing account, if
 * available, used to determine the backlink
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view billing account template.
 */
async function go(id, page, licenceId, chargeVersionId) {
  const billingAccountData = await FetchViewBillingAccountService.go(id, page)

  const pageData = ViewBillingAccountPresenter.go(billingAccountData, licenceId, chargeVersionId)

  const queryArgs = _queryArgs(chargeVersionId, licenceId)

  const pagination = PaginatorPresenter.go(
    pageData.pagination.total,
    Number(page),
    `/system/billing-accounts/${id}`,
    queryArgs
  )

  return {
    activeNavBar: 'search',
    ...pageData,
    pagination
  }
}

function _queryArgs(chargeVersionId, licenceId) {
  const queryArgs = {}

  if (licenceId) {
    queryArgs['licence-id'] = licenceId
  }

  if (chargeVersionId) {
    queryArgs['charge-version-id'] = chargeVersionId
  }

  return queryArgs
}

module.exports = {
  go
}
