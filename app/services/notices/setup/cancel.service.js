'use strict'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/cancel` page
 * @module CancelService
 */

const CancelPresenter = require('../../../presenters/notices/setup/cancel.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID for the notice setup session record
 *
 * @returns {Promise<object>} The view data for the cancel page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = CancelPresenter.go(session)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

module.exports = {
  go
}
