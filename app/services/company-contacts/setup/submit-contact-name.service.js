'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/contact-name' page
 *
 * @module SubmitContactNameService
 */

const ContactNamePresenter = require('../../../presenters/company-contacts/setup/contact-name.presenter.js')
const ContactNameValidator = require('../../../validators/company-contacts/setup/contact-name.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { checkUrl } = require('../../../lib/check-page.lib.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/contact-name' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: checkUrl(session, `/system/company-contacts/setup/${sessionId}/contact-email`)
    }
  }

  session.name = payload.name

  const pageData = ContactNamePresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.name = payload.name

  return session.$update()
}

function _validate(payload) {
  const validationResult = ContactNameValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
