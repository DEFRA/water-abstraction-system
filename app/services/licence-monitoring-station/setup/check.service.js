'use strict'

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @module CheckService
 */

const CheckPresenter = require('../../../presenters/licence-monitoring-station/setup/check.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _markCheckPageVisited(session)

  const pageData = CheckPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

async function _markCheckPageVisited(session) {
  session.checkPageVisited = true

  return session.$update()
}

module.exports = {
  go
}
