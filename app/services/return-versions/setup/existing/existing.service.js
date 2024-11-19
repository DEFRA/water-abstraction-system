'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/existing` page
 * @module ExistingService
 */

const ExistingPresenter = require('../../../../presenters/return-versions/setup/existing.presenter.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/existing` page
 *
 * Supports generating the data needed for the existing page in the return requirements setup journey. It fetches the
 * current session record and from it determines what radio buttons to display to the user.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the purpose page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = ExistingPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Use previous requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
