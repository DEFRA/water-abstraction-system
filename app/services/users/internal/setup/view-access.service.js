'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @module ViewAccessService
 */

const AccessPresenter = require('../../../../presenters/users/internal/setup/access.presenter.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = AccessPresenter.go(session)

  return pageData
}

module.exports = {
  go
}
