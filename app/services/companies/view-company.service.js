/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/{role}' page
 *
 * @module ViewCompanyService
 */

import CompanyPresenter from '../../presenters/companies/company.presenter.js'
import FetchCompanyDetailsDal from '../../dal/companies/fetch-company-details.dal.js'
import { roles } from '../../lib/static-lookups.lib.js'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/{role}' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {string} role - the licence role in kebab case e.g 'licence-holder'
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(companyId, role) {
  const companyDetails = await FetchCompanyDetailsDal(companyId, roles[role].name)

  const pageData = CompanyPresenter.go(companyDetails, role)

  return {
    ...pageData
  }
}
