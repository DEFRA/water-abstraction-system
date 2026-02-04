'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @module ViewCancelService
 */

const CancelPresenter = require('../../../presenters/company-contacts/setup/cancel.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = CancelPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
