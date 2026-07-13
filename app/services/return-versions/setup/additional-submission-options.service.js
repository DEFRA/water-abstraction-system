/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsService
 */

import AdditionalSubmissionOptionsPresenter from '../../../presenters/return-versions/setup/additional-submission-options.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/additional-submission-options` page
 *
 * Supports generating the data needed for the points page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the points page
 */
export default async function additionalSubmissionOptions(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = AdditionalSubmissionOptionsPresenter(session)

  return {
    ...formattedData
  }
}
