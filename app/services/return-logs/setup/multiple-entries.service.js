/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/multiple-entries` page
 * @module MultipleEntriesService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import MultipleEntriesPresenter from '../../../presenters/return-logs/setup/multiple-entries.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/multiple-entries` page
 *
 * Supports generating the data needed for the multiple entries page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the multiple entries page
 */
export default async function multipleEntries(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = MultipleEntriesPresenter(session)

  return {
    ...pageData
  }
}
