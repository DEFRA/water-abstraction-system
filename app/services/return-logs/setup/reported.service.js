/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/reported` page
 * @module ReportedService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import ReportedPresenter from '../../../presenters/return-logs/setup/reported.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/reported` page
 *
 * Supports generating the data needed for the reported page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the reported page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = ReportedPresenter.go(session)

  return {
    ...pageData
  }
}

export {
  go
}
export default {
  go
}
