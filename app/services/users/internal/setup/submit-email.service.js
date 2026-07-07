/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/email' page
 *
 * @module SubmitEmailService
 */

import CheckEmailExistsDal from '../../../../dal/users/check-email-exists.dal.js'
import EmailPresenter from '../../../../presenters/users/internal/setup/email.presenter.js'
import EmailValidator from '../../../../validators/users/internal/setup/email.validator.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { formatEmail, formatValidationResult } from '../../../../presenters/base.presenter.js'
import { checkUrl } from '../../../../lib/check-page.lib.js'
import { flashNotification } from '../../../../lib/general.lib.js'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/email' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const emailExists = await CheckEmailExistsDal.go(formatEmail(payload.email))

  const validationResult = _validate(payload, emailExists)

  if (!validationResult) {
    _notification(session, payload, yar)

    await _save(session, payload)

    return {
      redirectUrl: checkUrl(session, `/system/users/internal/setup/${sessionId}/permissions`)
    }
  }

  session.email = payload.email

  const pageData = EmailPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

function _notification(session, payload, yar) {
  if (session.checkPageVisited && session.email !== formatEmail(payload.email)) {
    flashNotification(yar, 'Updated', 'Email address updated')
  }
}

async function _save(session, payload) {
  session.email = formatEmail(payload.email)

  return session.$update()
}

function _validate(payload, emailExists) {
  const validationResult = EmailValidator.go(payload, emailExists)

  return formatValidationResult(validationResult)
}

export {
  go
}
export default {
  go
}
