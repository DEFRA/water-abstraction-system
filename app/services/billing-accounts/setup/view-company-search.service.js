/**
 * Orchestrates fetching and presenting the data for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @module ViewCompanySearchService
 */

import CompanySearchPresenter from '../../../presenters/billing-accounts/setup/company-search.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CompanySearchPresenter(session)

  return {
    ...pageData
  }
}
