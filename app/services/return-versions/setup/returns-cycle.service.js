/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/returns-cycle` page
 * @module ReturnsCycleService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import ReturnsCyclePresenter from '../../../presenters/return-versions/setup/returns-cycle.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/returns-cycle` page
 *
 * Supports generating the data needed for the returns cycle page in the return requirements setup journey. It fetches
 * the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the returns cycle page
 */
export default async function returnsCycleService(sessionId, requirementIndex) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = ReturnsCyclePresenter(session, requirementIndex)

  return {
    ...formattedData
  }
}
