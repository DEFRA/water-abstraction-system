'use strict'

/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsService
 */

const AdditionalSubmissionOptionsPresenter = require('../../../presenters/return-versions/setup/additional-submission-options.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for
 * `/return-versions/setup/{sessionId}/additional-submission-options` page
 *
 * Supports generating the data needed for the points page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the points page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = AdditionalSubmissionOptionsPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select any additional submission options for the return requirements',
    ...formattedData
  }
}

module.exports = {
  go
}
