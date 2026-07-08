/**
 * Orchestrates presenting the data for `/users/internal/setup/{sessionId}/cancel` page
 * @module ViewCancelService
 */

import CancelPresenter from '../../../../presenters/users/internal/setup/cancel.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates presenting the data for `/users/internal/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the cancel page
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CancelPresenter.go(session)

  return pageData
}

export {
  go
}
export default {
  go
}
