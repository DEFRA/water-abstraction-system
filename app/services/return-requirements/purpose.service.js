'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/purpose` page
 * @module PurposeService
 */

const FetchPurposesService = require('./fetch-purposes.service.js')
const SelectPurposePresenter = require('../../presenters/return-requirements/purpose.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/purpose` page
 *
 * Supports generating the data needed for the purpose page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<Object>} The view data for the purpose page
*/
async function go (sessionId, requirementIndex) {
  const session = await SessionModel.query().findById(sessionId)
  const purposesData = await FetchPurposesService.go(session.licence.id)

  const formattedData = SelectPurposePresenter.go(session, requirementIndex, purposesData)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the purpose for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
