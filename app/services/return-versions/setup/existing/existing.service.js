/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/existing` page
 * @module ExistingService
 */

import ExistingPresenter from '../../../../presenters/return-versions/setup/existing.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/existing` page
 *
 * Supports generating the data needed for the existing page in the return requirements setup journey. It fetches the
 * current session record and from it determines what radio buttons to display to the user.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the purpose page
 */
export default async function existingService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = ExistingPresenter(session)

  return {
    ...formattedData
  }
}
