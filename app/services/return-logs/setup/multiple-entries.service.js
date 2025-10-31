'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/multiple-entries` page
 * @module MultipleEntriesService
 */

const MultipleEntriesPresenter = require('../../../presenters/return-logs/setup/multiple-entries.presenter.js')
const SessionModel = require('../../../models/session.model.js')

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
  const session = await SessionModel.query().findById(sessionId)

  const pageData = MultipleEntriesPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
