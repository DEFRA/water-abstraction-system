/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 * @module StartReadingService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import StartReadingPresenter from '../../../presenters/return-logs/setup/start-reading.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = StartReadingPresenter.go(session)

  return {
    ...pageData
  }
}

export { go }
export default {
  go
}
