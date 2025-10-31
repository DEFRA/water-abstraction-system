'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 * @module StartReadingService
 */

const SessionModel = require('../../../models/session.model.js')
const StartReadingPresenter = require('../../../presenters/return-logs/setup/start-reading.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = StartReadingPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
