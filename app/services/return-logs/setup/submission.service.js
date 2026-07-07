/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/submission` page
 * @module SubmissionService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SubmissionPresenter from '../../../presenters/return-logs/setup/submission.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/submission` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = SubmissionPresenter.go(session)

  return {
    ...formattedData
  }
}

export {
  go
}
export default {
  go
}
