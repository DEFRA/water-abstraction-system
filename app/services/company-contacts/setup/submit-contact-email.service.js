/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @module SubmitContactEmailService
 */

import ContactEmailPresenter from '../../../presenters/company-contacts/setup/contact-email.presenter.js'
import ContactEmailValidator from '../../../validators/company-contacts/setup/contact-email.validator.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { checkUrl } from '../../../lib/check-page.lib.js'
import { flashNotification } from '../../../lib/general.lib.js'
import { formatEmail, formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    _notification(session, payload, yar)

    await _save(session, payload)

    return {
      redirectUrl: checkUrl(session, `/system/company-contacts/setup/${sessionId}/abstraction-alerts`)
    }
  }

  session.email = payload.email

  const pageData = ContactEmailPresenter.go(session)

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

function _validate(payload) {
  const validationResult = ContactEmailValidator.go(payload)

  return formatValidationResult(validationResult)
}

export {
  go
}
export default {
  go
}
