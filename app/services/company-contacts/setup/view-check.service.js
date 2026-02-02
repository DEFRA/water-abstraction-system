'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module ViewCheckService
 */

const CheckPresenter = require('../../../presenters/company-contacts/setup/check.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const { markCheckPageVisited } = require('../../../lib/check-page.lib.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await markCheckPageVisited(session)

  const pageData = CheckPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
