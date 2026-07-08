/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/cancel` page
 * @module CancelService
 */

import CancelPresenter from '../../../presenters/return-versions/setup/cancel.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/cancel` page
 *
 * Supports generating the data needed for the cancel requirements page in the return requirements setup journey. It
 * fetches the current session record and combines it with the date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the cancel requirements page
 */
async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = CancelPresenter.go(session)

  return {
    ...formattedData
  }
}

export { go }
export default {
  go
}
