/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/manual` page
 *
 * @module ManualService
 */

import FetchSessionDal from '../../dal/fetch-session.dal.js'
import ManualAddressPresenter from '../../presenters/address/manual.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/manual` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function manualService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = ManualAddressPresenter(session)

  return {
    ...pageData
  }
}
