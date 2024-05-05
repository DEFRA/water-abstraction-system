'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/purpose` page
 * @module PurposeService
 */

const FetchPurposesService = require('../../services/return-requirements/fetch-purposes.service.js')
const FetchSessionService = require('./fetch-session.service.js')
const SelectPurposePresenter = require('../../presenters/return-requirements/purpose.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/purpose` page
 *
 * Supports generating the data needed for the purpose page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The id of the current session
 *
 * @returns {Promise<Object>} The view data for the purpose page
*/
async function go (sessionId) {
  const session = await FetchSessionService.go(sessionId)
  const purposesData = await FetchPurposesService.go(session.licence.id)

  const formattedData = SelectPurposePresenter.go(session, purposesData)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the purpose for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
