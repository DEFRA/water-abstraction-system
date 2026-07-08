/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/history' page
 *
 * @module ViewHistoryService
 */

import FetchCompanyDal from '../../dal/companies/fetch-company.dal.js'
import FetchHistoryDal from '../../dal/companies/fetch-history.dal.js'
import HistoryPresenter from '../../presenters/companies/history.presenter.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/history' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(companyId, auth, page) {
  const company = await FetchCompanyDal(companyId)

  const { licences, totalNumber } = await FetchHistoryDal(companyId, page)

  const pageData = HistoryPresenter.go(company, licences)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/companies/${companyId}/history`,
    licences.length,
    'licences'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'history',
    pagination,
    roles: userRoles(auth)
  }
}
