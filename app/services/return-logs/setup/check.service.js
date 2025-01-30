'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/check` page
 * @module CheckService
 */

const SessionModel = require('../../../models/session.model.js')
const CheckPresenter = require('../../../presenters/return-logs/setup/check.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  await _markCheckPageVisited(session)

  const formattedData = CheckPresenter.go(session)

  const notification = yar.flash('notification')[0]

  return {
    activeNavBar: 'search',
    ...formattedData,
    notification
  }
}

async function _markCheckPageVisited(session) {
  session.checkPageVisited = true

  return session.$update()
}

module.exports = {
  go
}
