'use strict'

/**
 * Orchestrates validating the data for `address/{sessionId}/international` page
 *
 * @module SubmitInternationalService
 */

const InternationalPresenter = require('../../presenters/address/international.presenter.js')
const InternationalValidator = require('../../validators/address/international.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `address/{sessionId}/international` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = InternationalPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validation = InternationalValidator.go(payload)

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
