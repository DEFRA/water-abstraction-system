/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @module FAOService
 */

import FAOPresenter from '../../../presenters/billing-accounts/setup/fao.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = FAOPresenter.go(session)

  return {
    ...pageData
  }
}

export default {
  go
}
