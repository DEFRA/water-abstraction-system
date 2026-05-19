'use strict'

/**
 * Orchestrates validating the data for the '' page
 *
 * @module SubmitCheckService
 */

const CheckPresenter = require('../../../../presenters/users/internal/setup/check.presenter.js')
const CheckValidator = require('../../../../validators/users/internal/setup/check.validator.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const { formatValidationResult } = require('../../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = CheckPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = CheckValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
