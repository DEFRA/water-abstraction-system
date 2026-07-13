/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @module CheckService
 */

import CheckPresenter from '../../../presenters/licence-monitoring-station/setup/check.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function (sessionId) {
  const session = await FetchSessionDal(sessionId)

  await _markCheckPageVisited(session)

  const pageData = CheckPresenter(session)

  return {
    ...pageData
  }
}

async function _markCheckPageVisited(session) {
  session.checkPageVisited = true

  return session.$update()
}
