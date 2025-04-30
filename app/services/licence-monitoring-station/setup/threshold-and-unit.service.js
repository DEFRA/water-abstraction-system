'use strict'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit`
 * page
 * @module ThresholdAndUnitService
 */

const SessionModel = require('../../../models/session.model.js')
const ThresholdAndUnitPresenter = require('../../../presenters/licence-monitoring-station/setup/threshold-and-unit.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit`
 * page
 *
 * Supports generating the data needed for the threshold and unit page in the licence monitoring station setup journey.
 * It fetches the current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the threshold and unit page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = ThresholdAndUnitPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
