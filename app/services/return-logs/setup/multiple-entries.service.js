'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/multiple-entries` page
 * @module MultipleEntriesService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const MultipleEntriesPresenter = require('../../../presenters/return-logs/setup/multiple-entries.presenter.js')

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
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = MultipleEntriesPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
