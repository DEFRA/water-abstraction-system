'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @module ViewPermissionsService
 */

const PermissionsPresenter = require('../../../../presenters/users/internal/setup/permissions.presenter.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = PermissionsPresenter.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
