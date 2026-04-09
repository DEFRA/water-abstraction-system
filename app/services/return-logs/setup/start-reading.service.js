'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 * @module StartReadingService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const StartReadingPresenter = require('../../../presenters/return-logs/setup/start-reading.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = StartReadingPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
