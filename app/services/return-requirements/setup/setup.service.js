'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/setup` page
 * @module SetupService
 */

const SetupPresenter = require('../../../presenters/return-requirements/setup.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/setup` page
 *
 * Supports generating the data needed for the select reason page in the return requirements setup journey. It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = SetupPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'How do you want to set up the requirements for returns?',
    ...formattedData
  }
}

module.exports = {
  go
}
