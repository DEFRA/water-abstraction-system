/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @module ViewAccessService
 */

import AccessPresenter from '../../../../presenters/users/internal/setup/access.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewAccess(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AccessPresenter(session)

  return pageData
}
