'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-log-edit/{sessionId}/start` page
 * @module StartService
 */

const SessionModel = require('../../../models/session.model.js')
const StartPresenter = require('../../../presenters/return-logs/setup/start.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-log-edit/{sessionId}/start` page
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  return StartPresenter.go(session)
}

module.exports = {
  go
}
