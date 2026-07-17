/**
 * Orchestrates fetching and presenting the data for the '/billing-accounts/setup/{sessionId}/select-company' page
 *
 * @module ViewSelectCompanyService
 */

import FetchCompaniesService from './fetch-companies.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SelectCompanyPresenter from '../../../presenters/billing-accounts/setup/select-company.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/billing-accounts/setup/{sessionId}/select-company' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewSelectCompanyService(sessionId) {
  const session = await FetchSessionDal(sessionId)
  const companies = await FetchCompaniesService(session.companySearch)

  const pageData = SelectCompanyPresenter(session, companies)

  return {
    ...pageData
  }
}
