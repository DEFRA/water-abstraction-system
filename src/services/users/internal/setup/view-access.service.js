/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @module ViewAccessService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import AccessPresenter from '../../../../presenters/users/internal/setup/access.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewAccessService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AccessPresenter(session)

  return pageData
}
