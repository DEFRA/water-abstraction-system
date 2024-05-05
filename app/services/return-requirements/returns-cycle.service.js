'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/returns-cycle` page
 * @module ReturnsCycleService
 */

const FetchSessionService = require('./fetch-session.service.js')
const ReturnsCyclePresenter = require('../../presenters/return-requirements/returns-cycle.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/returns-cycle` page
 *
 * Supports generating the data needed for the returns cycle page in the return requirements setup journey. It fetches
 * the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<Object>} The view data for the returns cycle page
*/
async function go (sessionId) {
  const session = await FetchSessionService.go(sessionId)

  const formattedData = ReturnsCyclePresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the returns cycle for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
