/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @module ViewCancelService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import CancelPresenter from '../../../presenters/company-contacts/setup/cancel.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewCancelService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CancelPresenter(session)

  return {
    ...pageData
  }
}
