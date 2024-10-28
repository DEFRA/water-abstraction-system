'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/returns-cycle` page
 * @module ReturnsCycleService
 */

const ReturnsCyclePresenter = require('../../../presenters/return-versions/setup/returns-cycle.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/returns-cycle` page
 *
 * Supports generating the data needed for the returns cycle page in the return requirements setup journey. It fetches
 * the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the returns cycle page
 */
async function go (sessionId, requirementIndex) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = ReturnsCyclePresenter.go(session, requirementIndex)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the returns cycle for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
