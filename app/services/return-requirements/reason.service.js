'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/reason` page
 * @module SelectReasonService
 */

const FetchSessionService = require('./fetch-session.service.js')
const SelectReasonPresenter = require('../../presenters/return-requirements/reason.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/reason` page
 *
 * Supports generating the data needed for the select reason page in the return requirements setup journey. It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} id - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} page data needed by the view template
 */
async function go (sessionId) {
  const session = await FetchSessionService.go(sessionId)
  const formattedData = SelectReasonPresenter.go(session)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.checkYourAnswersVisited,
    pageTitle: 'Select the reason for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
