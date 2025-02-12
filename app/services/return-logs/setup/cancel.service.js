'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/cancel` page
 * @module CancelService
 */

const CancelPresenter = require('../../../presenters/return-logs/setup/cancel.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The page data needed by the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = CancelPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
