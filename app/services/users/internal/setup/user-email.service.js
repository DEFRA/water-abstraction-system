'use strict'

/**
 * Orchestrates fetching and presenting the data for '/users/internal/setup/{sessionId}/user-email' page
 * @module UserEmailService
 */

const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const UserEmailPresenter = require('../../../../presenters/users/internal/setup/user-email.presenter.js')

/**
 * Orchestrates fetching and presenting the data for '/users/internal/setup/{sessionId}/user-email' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = UserEmailPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
