'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @module RecipientNameService
 */

const RecipientNamePresenter = require('../../../presenters/notices/setup/recipient-name.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = RecipientNamePresenter.go(session)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
