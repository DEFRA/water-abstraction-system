/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module FullConditionService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import FetchFullConditionDal from '../../../dal/licence-monitoring-station/setup/fetch-full-condition.dal.js'
import FullConditionPresenter from '../../../presenters/licence-monitoring-station/setup/full-condition.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function fullConditionService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const conditions = await FetchFullConditionDal(session.licenceId)

  const pageData = FullConditionPresenter(session, conditions)

  return {
    ...pageData
  }
}
