/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/period-used` page
 * @module PeriodUsedService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import PeriodUsedPresenter from '../../../presenters/return-logs/setup/period-used.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/period-used` page
 *
 * Supports generating the data needed for the period used page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the period used page
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = PeriodUsedPresenter.go(session)

  return {
    ...pageData
  }
}

export { go }
export default {
  go
}
