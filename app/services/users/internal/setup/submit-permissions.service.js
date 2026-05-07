'use strict'

/**
 * Orchestrates validating the data for the '' page
 *
 * @module SubmitPermissionsService
 */

const PermissionsPresenter = require('../../../../presenters/users/internal/setup/permissions.presenter.js')
const PermissionsValidator = require('../../../../validators/users/internal/setup/permissions.validator.js')
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

  const pageData = PermissionsPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = PermissionsValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
