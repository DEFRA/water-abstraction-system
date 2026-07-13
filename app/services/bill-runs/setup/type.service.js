/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/type` page
 * @module TypeService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import TypePresenter from '../../../presenters/bill-runs/setup/type.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/type` page
 *
 * Supports generating the data needed for the type page in the setup bill run journey. It fetches the current
 * session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the type page
 */
export default async function (sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = TypePresenter(session)

  return {
    activeNavBar: 'bill-runs',
    ...pageData
  }
}
