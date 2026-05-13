'use strict'

/**
 * Orchestrates fetching and presenting the data for '/users/internal/setup/{sessionId}/email' page
 * @module ViewEmailService
 */

const EmailPresenter = require('../../../../presenters/users/internal/setup/email.presenter.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for '/users/internal/setup/{sessionId}/email' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = EmailPresenter.go(session)

  return pageData
}

module.exports = {
  go
}
