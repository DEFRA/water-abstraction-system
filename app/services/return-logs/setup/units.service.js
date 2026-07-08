/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/units` page
 * @module UnitsService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import UnitsPresenter from '../../../presenters/return-logs/setup/units.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/units` page
 *
 * Supports generating the data needed for the units page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the units page
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = UnitsPresenter(session)

  return {
    ...pageData
  }
}
