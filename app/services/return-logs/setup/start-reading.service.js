/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 * @module StartReadingService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import StartReadingPresenter from '../../../presenters/return-logs/setup/start-reading.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} page data needed by the view template
 */
export default async function startReading(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = StartReadingPresenter(session)

  return {
    ...pageData
  }
}
