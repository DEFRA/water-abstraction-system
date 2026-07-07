/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/cancel` page
 * @module CancelService
 */

import CancelPresenter from '../../../presenters/return-logs/setup/cancel.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The page data needed by the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = CancelPresenter.go(session)

  return {
    ...formattedData
  }
}

export { go }
export default {
  go
}
