'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/frequency-collected` page
 * @module FrequencyCollectedService
 */

const FrequencyCollectedPresenter = require('../../../presenters/return-versions/setup/frequency-collected.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/frequency-collected` page
 *
 * Supports generating the data needed for the frequency collected page in the return requirements setup journey. It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the frequency collected page
 */
async function go (sessionId, requirementIndex) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = FrequencyCollectedPresenter.go(session, requirementIndex)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select how often readings or volumes are collected',
    ...formattedData
  }
}

module.exports = {
  go
}
