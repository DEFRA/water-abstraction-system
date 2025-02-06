'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/period-used` page
 * @module PeriodUsedService
 */

const PeriodUsedPresenter = require('../../../presenters/return-logs/setup/period-used.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/period-used` page
 *
 * Supports generating the data needed for the period used page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the period used page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = PeriodUsedPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
