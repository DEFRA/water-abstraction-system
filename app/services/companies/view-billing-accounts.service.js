/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/billing-accounts' page
 *
 * @module ViewBillingAccountsService
 */

import BillingAccountsPresenter from '../../presenters/companies/billing-accounts.presenter.js'
import FetchBillingAccountsDal from '../../dal/companies/fetch-billing-accounts.dal.js'
import FetchCompanyDal from '../../dal/companies/fetch-company.dal.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/billing-accounts' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function (companyId, auth, page) {
  const company = await FetchCompanyDal(companyId)

  const { billingAccounts, totalNumber } = await FetchBillingAccountsDal(companyId, page)

  const pageData = BillingAccountsPresenter(company, billingAccounts)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/companies/${companyId}/billing-accounts`,
    billingAccounts.length,
    'billing accounts'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'billing-accounts',
    pagination,
    roles: userRoles(auth)
  }
}
