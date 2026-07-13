/**
 * Orchestrates fetching and presenting the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @module ViewCancelService
 */

import CancelPresenter from '../../../../presenters/users/external/setup/cancel.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function (sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CancelPresenter(session)

  return pageData
}
