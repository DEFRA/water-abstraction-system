'use strict'

/**
 * Orchestrates fetching and presenting the data for '/users/external/setup/{sessionId}/licences' page
 * @module ViewUserEmailService
 */

const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const LicencesPresenter = require('../../../../presenters/users/external/setup/licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for '/users/external/setup/{sessionId}/licences' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = LicencesPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
