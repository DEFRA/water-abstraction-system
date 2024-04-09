'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredService
 */
const NoReturnsRequiredPresenter = require('../../presenters/return-requirements/no-returns-required.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/no-returns-required` page
 *
 * Supports generating the data needed for the no returns required page in the return requirements setup journey. It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} id - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} The view data for the no returns required page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = NoReturnsRequiredPresenter.go(session)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.data.checkYourAnswersVisited,
    pageTitle: 'Why are no returns required?',
    ...formattedData
  }
}

module.exports = {
  go
}
