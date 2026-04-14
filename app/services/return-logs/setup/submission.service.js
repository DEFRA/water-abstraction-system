'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/submission` page
 * @module SubmissionService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const SubmissionPresenter = require('../../../presenters/return-logs/setup/submission.presenter.js')

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

module.exports = {
  go
}
