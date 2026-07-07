/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @module ViewCancelService
 */

import CancelPresenter from '../../../presenters/company-contacts/setup/cancel.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = CancelPresenter.go(session)

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
