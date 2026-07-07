/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/account` page
 *
 * @module ViewAccountService
 */

import AccountPresenter from '../../../presenters/billing-accounts/setup/account.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/account` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = AccountPresenter.go(session)

  return {
    ...pageData
  }
}

export default {
  go
}
