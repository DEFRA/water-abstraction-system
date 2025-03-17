'use strict'

/**
 * Orchestrates presenting the data for `/notifications/setup/{sessionId}/confirmation` page
 * @module ConfirmationService
 */

const ConfirmationPresenter = require('../../../presenters/notifications/setup/confirmation.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates presenting the data for `/notifications/setup/{sessionId}/confirmation` page
 *
 * @param {string} sessionId - The UUID for the notification setup session record
 *
 * @returns {Promise<object>} The view data for the licence page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = ConfirmationPresenter.go(session)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

module.exports = {
  go
}
