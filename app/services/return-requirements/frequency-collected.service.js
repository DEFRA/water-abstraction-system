'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/frequency-collected` page
 * @module FrequencyCollectedService
 */

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/frequency-collected` page
 *
 * Supports generating the data needed for the frequency collected page in the return requirements setup journey. It fetches
 * the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<Object>} The view data for the frequency collected page
*/
const FrequencyCollectedPresenter = require('../../presenters/return-requirements/frequency-collected.presenter.js')
const SessionModel = require('../../models/session.model.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = FrequencyCollectedPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select how often readings or volumes are collected',
    ...formattedData
  }
}

module.exports = {
  go
}
