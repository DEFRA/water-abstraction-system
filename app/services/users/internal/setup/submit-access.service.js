/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @module SubmitAccessService
 */

import AccessPresenter from '../../../../presenters/users/internal/setup/access.presenter.js'
import AccessValidator from '../../../../validators/users/internal/setup/access.validator.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'
import { flashNotification } from '../../../../lib/general.lib.js'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function (sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    _notification(session, payload, yar)

    await _save(session, payload)

    return {
      redirectUrl: `/system/users/internal/setup/${sessionId}/check`
    }
  }

  const pageData = AccessPresenter(session)

  return {
    error: validationResult,
    ...pageData
  }
}

function _notification(session, payload, yar) {
  if (session.access !== payload.access) {
    flashNotification(yar, 'Updated', 'Access updated')
  }
}

async function _save(session, payload) {
  session.access = payload.access

  return session.$update()
}

function _validate(payload) {
  const validationResult = AccessValidator(payload)

  return formatValidationResult(validationResult)
}
