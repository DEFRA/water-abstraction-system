'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-details` page
 * @module MeterDetailsService
 */

const MeterDetailsPresenter = require('../../../presenters/return-logs/setup/meter-details.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-details` page
 *
 * Supports generating the data needed for the meter details page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the meter details page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = MeterDetailsPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
