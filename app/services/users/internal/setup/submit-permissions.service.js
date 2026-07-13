/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @module SubmitPermissionsService
 */

import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import FetchUserDetailsDal from '../../../../dal/users/internal/fetch-user-details.dal.js'
import PermissionsPresenter from '../../../../presenters/users/internal/setup/permissions.presenter.js'
import PermissionsValidator from '../../../../validators/users/internal/setup/permissions.validator.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'
import { flashNotification } from '../../../../lib/general.lib.js'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @param {object} auth - The current user's authentication details from `request.auth`, used to determine which
 * permissions to show
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function submitPermissionsService(auth, sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    _notification(session, payload, yar)

    await _save(session, payload)

    return {
      redirectUrl: `/system/users/internal/setup/${sessionId}/check`
    }
  }

  const pageData = PermissionsPresenter(session)

  const showSuperPermission = await _showSuperPermission(auth)

  return {
    error: validationResult,
    ...pageData,
    showSuperPermission
  }
}

function _notification(session, payload, yar) {
  if (session.checkPageVisited && session.permission !== payload.permission) {
    flashNotification(yar, 'Updated', 'Permissions updated')
  }
}

async function _save(session, payload) {
  session.permission = payload.permission

  return session.$update()
}

async function _showSuperPermission(auth) {
  const currentUser = await FetchUserDetailsDal(auth.credentials.user.id)

  return currentUser.$permissions().key === 'super'
}

function _validate(payload) {
  const validationResult = PermissionsValidator(payload)

  return formatValidationResult(validationResult)
}
