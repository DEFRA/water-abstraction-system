/**
 * Orchestrates fetching and presenting the data needed for the view billing account page
 * @module ViewBillingAccountService
 */

import PaginatorPresenter from 'water-abstraction-engine/presenters/paginator.presenter.js'

import FetchViewBillingAccountService from '../billing-accounts/fetch-view-billing-account.service.js'
import ViewBillingAccountPresenter from '../../presenters/billing-accounts/view-billing-account.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the view billing account page
 *
 * @param {string} id - The UUID of the billing account to view
 * @param {string} page - The current page for the pagination service
 * @param {string|undefined} licenceId - The UUID of the licence related to the billing account, if available, used to
 * determine the backlink
 * @param {string|undefined} chargeVersionId - The UUID of the charge version related to the billing account, if
 * available, used to determine the backlink
 * @param {string|undefined} companyId - The UUID of the company (customer) related to the billing account, if
 * available, used to determine the backlink
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view billing account template.
 */
export default async function viewBillingAccountService(id, page, licenceId, chargeVersionId, companyId) {
  const { totalNumber, ...billingAccountData } = await FetchViewBillingAccountService(id, page)

  const pageData = ViewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId)

  const queryArgs = _queryArgs(chargeVersionId, licenceId)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/billing-accounts/${id}`,
    billingAccountData.bills.length,
    'bills',
    queryArgs
  )

  return {
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
