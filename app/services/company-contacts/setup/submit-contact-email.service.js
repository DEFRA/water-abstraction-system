'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @module SubmitContactEmailService
 */

const ContactEmailPresenter = require('../../../presenters/company-contacts/setup/contact-email.presenter.js')
const ContactEmailValidator = require('../../../validators/company-contacts/setup/contact-email.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = ContactEmailPresenter.go(session)

  return {
    activeNavBar: '',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = ContactEmailValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
