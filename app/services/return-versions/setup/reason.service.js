/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/reason` page
 * @module SelectReasonService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SelectReasonPresenter from '../../../presenters/return-versions/setup/reason.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/reason` page
 *
 * Supports generating the data needed for the select reason page in the return requirements setup journey. It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<object>} page data needed by the view template
 */
export default async function reason(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = SelectReasonPresenter(session)

  return {
    ...formattedData
  }
}
