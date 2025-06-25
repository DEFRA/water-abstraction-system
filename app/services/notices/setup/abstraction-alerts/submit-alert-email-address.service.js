'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @module SubmitAlertEmailAddressService
 */

const AlertEmailAddressPresenter = require('../../../../presenters/notices/setup/abstraction-alerts/alert-email-address.presenter.js')
const AlertEmailAddressValidator = require('../../../../validators/notices/setup/abstraction-alerts/alert-email-address.validator.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload, auth)

    return {}
  }

  const submittedSessionData = _submittedSessionData(session, auth, validationResult, payload)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...submittedSessionData
  }
}

async function _save(session, payload, auth) {
  const { alertEmailAddressType } = payload

  if (alertEmailAddressType === 'username') {
    session.alertEmailAddress = auth.credentials.user.username
  }

  if (alertEmailAddressType === 'other') {
    session.alertEmailAddress = payload.otherUser
  }

  session.alertEmailAddressType = alertEmailAddressType

  return session.$update()
}

/**
 * Combines the existing session data with the submitted payload formatted by the presenter. If nothing is submitted by
 * the user, payload will be an empty object.
 *
 * @private
 */
function _submittedSessionData(session, auth, validationResult, payload) {
  const { alertEmailAddressType } = payload

  if (alertEmailAddressType === 'username') {
    session.alertEmailAddress = auth.credentials.user.username
  }

  if (alertEmailAddressType === 'other') {
    session.alertEmailAddress = payload.otherUser ? payload.otherUser : null
  }

  session.alertEmailAddressType = alertEmailAddressType

  return AlertEmailAddressPresenter.go(session, auth, validationResult, payload)
}

/**
 * Validates the submitted form data using `AlertEmailAddressValidator`.
 *
 * If the validation passes with no errors, it returns `null`. If validation fails, it returns an object containing
 * error messages for the appropriate form fields.
 *
 * The `radioFormError` and `emailAddressInputFormError` fields indicate where the error should be displayed.
 * The validator provides a `context` property indicating which field caused the error, allowing us to differentiate
 * between cases where the user selected "Use another email address" without entering an email address, or selected no
 * option at all.
 *
 * @param {object} payload - The submitted form data
 *
 * @returns {null|object} returns null if validation passes or returns an object with the error messages and where they
 * need to be displayed
 */
function _validate(payload) {
  const validation = AlertEmailAddressValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message, context } = validation.error.details[0]

  return {
    text: message,
    radioFormError: context.label === 'alertEmailAddressType' ? { text: message } : null,
    emailAddressInputFormError: context.label === 'otherUser' ? { text: message } : null
  }
}

module.exports = {
  go
}
