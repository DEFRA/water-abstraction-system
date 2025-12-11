'use strict'

/**
 * Orchestrates validating the data for `` page
 *
 * @module SubmitSelectAccountService
 */

const SelectAccountPresenter = require('../../../presenters/billing-accounts/setup/select-account.presenter.js')
const SelectAccountValidator = require('../../../validators/billing-accounts/setup/select-account.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `` page
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

  const pageData = SelectAccountPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = SelectAccountValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
