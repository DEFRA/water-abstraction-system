'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/setup` page
 * @module SetupService
 */

const FetchReturnRequirementsService = require('./fetch-return-requirements.service.js')
const SetupPresenter = require('../../presenters/return-requirements/setup.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/setup` page
 *
 * Supports generating the data needed for selecting how you want to set up the return in the return requirements setup journey.
 * It fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const existingData = await FetchReturnRequirementsService.go(session.licence.id)

  const formattedData = SetupPresenter.go(session, existingData)

  return {
    activeNavBar: 'search',
    pageTitle: 'How do you want to set up the requirements for returns?',
    ...formattedData
  }
}

module.exports = {
  go
}
