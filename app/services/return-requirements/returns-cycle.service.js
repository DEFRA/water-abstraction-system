'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/returns-cycle` page
 * @module ReturnsCycleService
 */

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
const ReturnsCyclePresenter = require('../../presenters/return-requirements/returns-cycle.presenter.js')
const SessionModel = require('../../models/session.model.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

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
