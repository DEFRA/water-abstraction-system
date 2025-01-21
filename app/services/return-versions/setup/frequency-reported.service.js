'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/frequency-reported` page
 * @module FrequencyReportedService
 */

const FrequencyReportedPresenter = require('../../../presenters/return-versions/setup/frequency-reported.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/frequency-reported` page
 *
 * Supports generating the data needed for the frequency reported page in the return requirements setup journey. It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the frequency reported page
 */
async function go(sessionId, requirementIndex) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = FrequencyReportedPresenter.go(session, requirementIndex)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
