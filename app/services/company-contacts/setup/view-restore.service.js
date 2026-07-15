/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/restore' page
 *
 * @module ViewRestoreService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import RestorePresenter from '../../../presenters/company-contacts/setup/restore.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/restore' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewRestoreService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = RestorePresenter(session)

  return {
    ...pageData
  }
}
