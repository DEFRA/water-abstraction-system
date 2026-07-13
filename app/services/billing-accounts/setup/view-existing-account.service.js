/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @module ExistingAccountService
 */

import ExistingAccountPresenter from '../../../presenters/billing-accounts/setup/existing-account.presenter.js'
import FetchExistingCompaniesService from './fetch-existing-companies.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewExistingAccount(sessionId) {
  const session = await FetchSessionDal(sessionId)
  const companySearchResults = await FetchExistingCompaniesService(session.searchInput)

  const pageData = ExistingAccountPresenter(session, companySearchResults)

  return {
    ...pageData
  }
}
