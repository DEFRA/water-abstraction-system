'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/start-date` page
 * @module StartDateService
 */

const SessionModel = require('../../../models/session.model.js')
const StartDatePresenter = require('../../../presenters/return-versions/setup/start-date.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/start-date` page
 *
 * Supports generating the data needed for the start date page in the return requirements setup journey. It fetches the
 * current session record and combines it with the radio buttons, date fields and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the start date page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = StartDatePresenter.go(session)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
