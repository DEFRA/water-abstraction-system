'use strict'

/**
 * Orchestrates presenting the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 * @module StopOrReduceService
 */

const SessionModel = require('../../../../models/session.model.js')
const StopOrReducePresenter = require('../../../../presenters//licence-monitoring-station/setup/stop-or-reduce.presenter.js')

/**
 * Orchestrates presenting the data for `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = StopOrReducePresenter.go(session)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
