'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{billingAccountId}/select-account` page
 *
 * @module SubmitSelectAccountService
 */

const SessionModel = require('../../../models/session.model.js')
const SelectAccountPresenter = require('../../../presenters/billing-accounts/setup/select-account.presenter.js')
const SelectAccountValidator = require('../../../validators/billing-accounts/setup/select-account.validator.js')

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{billingAccountId}/select-account` page
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

    return {
      accountSelected: payload.accountSelected
    }
  }

  const pageData = await _submissionData(session, payload)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.accountSelected = payload.accountSelected

  return session.$update()
}

async function _submissionData(session, payload) {
  session.accountSelected = payload.accountSelected

  return SelectAccountPresenter.go(session)
}

function _validate(payload) {
  const validationResult = SelectAccountValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
