'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/frequency-reported` page
 * @module FrequencyReportedService
 */

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/frequency-reported` page
 *
 * Supports generating the data needed for the frequency reported page in the return requirements setup journey. It fetches
 * the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<Object>} The view data for the frequency reported page
*/
const FrequencyReportedPresenter = require('../../presenters/return-requirements/frequency-reported.presenter.js')
const SessionModel = require('../../models/session.model.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = FrequencyReportedPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select how often readings or volumes are reported',
    ...formattedData
  }
}

module.exports = {
  go
}
