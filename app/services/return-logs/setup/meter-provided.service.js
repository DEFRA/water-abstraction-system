'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-provided` page
 * @module MeterProvidedService
 */

const MeterProvidedPresenter = require('../../../presenters/return-logs/setup/meter-provided.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/meter-provided` page
 *
 * Supports generating the data needed for the meter provided page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the meter provided page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = MeterProvidedPresenter.go(session)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
