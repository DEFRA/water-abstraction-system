'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @module SubmitReturnsForPaperFormsService
 */

const ReturnsForPaperFormsPresenter = require('../../../presenters/notices/setup/returns-for-paper-forms.presenter.js')
const ReturnsForPaperFormsValidator = require('../../../validators/notices/setup/returns-for-paper-forms.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  if (payload.returns && !Array.isArray(payload?.returns)) {
    payload.returns = [payload?.returns]
  }

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = ReturnsForPaperFormsPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.returns = payload.returns

  return session.$update()
}

function _validate(payload) {
  const validation = ReturnsForPaperFormsValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
