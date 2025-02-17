'use strict'

/**
 * Orchestrates presenting the data for `/notifications/setup/{sessionId}/cancel` page
 * @module CancelService
 */

const SessionModel = require('../../../models/session.model.js')
const CancelPresenter = require('../../../presenters/notifications/setup/cancel.presenter.js')

/**
 * Orchestrates presenting the data for `/notifications/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 *
 * @returns {Promise<object>} The view data for the licence page
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
