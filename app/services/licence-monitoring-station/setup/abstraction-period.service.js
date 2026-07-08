/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @module AbstractionPeriodService
 */

import AbstractionPeriodPresenter from '../../../presenters/licence-monitoring-station/setup/abstraction-period.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = AbstractionPeriodPresenter.go(session)

  return {
    ...pageData
  }
}

export {
  go
}
export default {
  go
}
