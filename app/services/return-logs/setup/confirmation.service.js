'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/confirmation` page
 * @module ConfirmationService
 */

const ConfirmationPresenter = require('../../../presenters/return-logs/setup/confirmation.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/confirmation` page
 *
 * Supports generating the data needed for the confirmation page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the confirmation page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = ConfirmationPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
