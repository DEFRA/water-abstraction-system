'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/purpose` page
 * @module PurposeService
 */

const FetchPurposesService = require('./fetch-purposes.service.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const SelectPurposePresenter = require('../../../presenters/return-versions/setup/purpose.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/purpose` page
 *
 * Supports generating the data needed for the purpose page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the purpose page
 */
async function go(sessionId, requirementIndex) {
  const session = await FetchSessionDal.go(sessionId)
  const purposesData = await FetchPurposesService.go(session.licenceVersion.id)

  const formattedData = SelectPurposePresenter.go(session, requirementIndex, purposesData)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
