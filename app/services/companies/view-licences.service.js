/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/licences' page
 *
 * @module ViewLicencesService
 */

import FetchCompanyDal from '../../dal/companies/fetch-company.dal.js'
import FetchLicencesDal from '../../dal/companies/fetch-licences.dal.js'
import LicencesPresenter from '../../presenters/companies/licences.presenter.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/licences' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, auth, page) {
  const company = await FetchCompanyDal.go(companyId)

  const { licences, totalNumber } = await FetchLicencesDal.go(companyId, page)

  const pageData = LicencesPresenter.go(company, licences)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/companies/${companyId}/licences`,
    licences.length,
    'licences'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'licences',
    pagination,
    roles: userRoles(auth)
  }
}

export {
  go
}
export default {
  go
}
