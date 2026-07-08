/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/start-date` page
 * @module StartDateService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import StartDatePresenter from '../../../presenters/return-versions/setup/start-date.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/start-date` page
 *
 * Supports generating the data needed for the start date page in the return requirements setup journey. It fetches the
 * current session record and combines it with the radio buttons, date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the start date page
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = StartDatePresenter.go(session)

  return {
    ...formattedData
  }
}
