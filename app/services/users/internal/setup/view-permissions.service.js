/**
 * Orchestrates fetching and presenting the data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @module ViewPermissionsService
 */

import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import FetchUserDetailsDal from '../../../../dal/users/internal/fetch-user-details.dal.js'
import PermissionsPresenter from '../../../../presenters/users/internal/setup/permissions.presenter.js'

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

  const pageData = PermissionsPresenter.go(session)

  const showSuperPermission = await _showSuperPermission(auth)

  return {
    ...pageData,
    showSuperPermission
  }
}

async function _showSuperPermission(auth) {
  const currentUser = await FetchUserDetailsDal.go(auth.credentials.user.id)

  return currentUser.$permissions().key === 'super'
}

export default {
  go
}
