/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/remove/{requirementIndex}` page
 * @module RemoveService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import RemovePresenter from '../../../presenters/return-versions/setup/remove.presenter.js'

/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/remove/{requirementIndex}` page
 *
 * Supports generating the data needed for the remove requirements page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being removed
 *
 * @returns {Promise<object>} The view data for the remove requirements page
 */
export default async function go(sessionId, requirementIndex) {
  const session = await FetchSessionDal(sessionId)
  const formattedData = RemovePresenter(session, requirementIndex)

  return {
    ...formattedData
  }
}
