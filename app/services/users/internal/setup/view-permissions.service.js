'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @module ViewPermissionsService
 */

const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const FetchUserDetailsDal = require('../../../../dal/users/internal/fetch-user-details.dal.js')
const PermissionsPresenter = require('../../../../presenters/users/internal/setup/permissions.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @param {object} auth - The current user's authentication details from `request.auth`, used to determine which
 * permissions to show
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(auth, sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const isSuper = await _isSuper(auth)

  const pageData = PermissionsPresenter.go(session)

  return {
    ...pageData,
    isSuper
  }
}

async function _isSuper(auth) {
  const currentUser = await FetchUserDetailsDal.go(auth.credentials.user.id)
  const isSuper = currentUser.$permissions().key === 'super'

  return isSuper
}

module.exports = {
  go
}
