'use strict'

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/manual` page
 *
 * @module ManualService
 */

const ManualAddressPresenter = require('../../presenters/address/manual.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the `address/{sessionId}/manual` page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = ManualAddressPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
