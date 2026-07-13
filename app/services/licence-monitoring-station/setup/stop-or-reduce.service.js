/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 * @module StopOrReduceService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import StopOrReducePresenter from '../../../presenters/licence-monitoring-station/setup/stop-or-reduce.presenter.js'

/**
 * Orchestrates presenting the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function stopOrReduce(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = StopOrReducePresenter(session)

  return {
    ...pageData
  }
}
