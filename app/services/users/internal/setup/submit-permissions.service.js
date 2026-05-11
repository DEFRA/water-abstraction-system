'use strict'

/**
 * Orchestrates validating the data for the '' page
 *
 * @module SubmitPermissionsService
 */

const { formatValidationResult } = require('../../../../presenters/base.presenter.js')
const { flashNotification } = require('../../../../lib/general.lib.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const PermissionsPresenter = require('../../../../presenters/users/internal/setup/permissions.presenter.js')
const PermissionsValidator = require('../../../../validators/users/internal/setup/permissions.validator.js')

/**
 * Orchestrates validating the data for the '' page
 *
 * @param {string} sessionId - The UUID of the current session
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
      redirectUrl: `/system/users/internal/setup/${sessionId}/check`
    }
  }

  const pageData = PermissionsPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

function _notification(session, payload, yar) {
  if (session.checkPageVisited && session.permissions !== payload.permissions) {
    flashNotification(yar, 'Updated', 'Permissions updated')
  }
}

async function _save(session, payload) {
  session.permissions = payload.permissions

  return session.$update()
}

function _validate(payload) {
  const validationResult = PermissionsValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
