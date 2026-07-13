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
export default async function cancelService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = CancelPresenter(session)

  return {
    ...formattedData
  }
}
