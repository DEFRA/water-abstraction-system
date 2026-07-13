/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-details` page
 * @module MeterDetailsService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import MeterDetailsPresenter from '../../../presenters/return-logs/setup/meter-details.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-details` page
 *
 * Supports generating the data needed for the meter details page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the meter details page
 */
export default async function (sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = MeterDetailsPresenter(session)

  return {
    ...pageData
  }
}
