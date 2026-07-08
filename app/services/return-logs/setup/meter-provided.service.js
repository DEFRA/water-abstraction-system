/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-provided` page
 * @module MeterProvidedService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import MeterProvidedPresenter from '../../../presenters/return-logs/setup/meter-provided.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-provided` page
 *
 * Supports generating the data needed for the meter provided page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the meter provided page
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = MeterProvidedPresenter.go(session)

  return {
    ...pageData
  }
}

export { go }
export default {
  go
}
