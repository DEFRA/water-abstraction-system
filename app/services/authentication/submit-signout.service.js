'use strict'

/**
 * Handles requests to the `/signout` endpoint
 *
 * @module SubmitSignoutService
 */

const SessionModel = require('../../models/session.model.js')
const { formatValidationResult } = require('../../presenters/base.presenter.js')

/**
 * Handles requests to the `/signout` endpoint
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

  const pageData = SignoutPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = SignoutValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
