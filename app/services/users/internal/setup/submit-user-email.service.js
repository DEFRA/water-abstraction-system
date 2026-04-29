'use strict'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/user-email' page
 *
 * @module SubmitUserEmailService
 */

const CheckEmailExistsDal = require('../../../../dal/users/check-email-exists.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const UserEmailPresenter = require('../../../../presenters/users/internal/setup/user-email.presenter.js')
const UserEmailValidator = require('../../../../validators/users/internal/setup/user-email.validator.js')
const { checkUrl } = require('../../../../lib/check-page.lib.js')
const { flashNotification } = require('../../../../lib/general.lib.js')
const { formatEmail, formatValidationResult } = require('../../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/user-email' page
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
      redirectUrl: checkUrl(session, `/system/users/internal/setup/${sessionId}/select-permissions`)
    }
  }

  session.email = payload.email

  const pageData = UserEmailPresenter.go(session)

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
  const validationResult = UserEmailValidator.go(payload, emailExists)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
