/**
 * Orchestrates fetching and presenting the data for the `/licence-monitoring-station/setup/{sessionId}/licence-number`
 * page
 *
 * @module LicenceNumberService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import LicenceNumberPresenter from '../../../presenters/licence-monitoring-station/setup/licence-number.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = LicenceNumberPresenter(session)

  return {
    ...pageData
  }
}
