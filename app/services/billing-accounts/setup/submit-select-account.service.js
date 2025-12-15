'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{billingAccountId}/select-account` page
 *
 * @module SubmitSelectAccountService
 */

const ViewSelectAccountPresenter = require('../../../presenters/billing-accounts/setup/view-select-account.presenter.js')
const ViewSelectAccountValidator = require('../../../validators/billing-accounts/setup/view-select-account.validator.js')
const SessionModel = require('../../../models/session.model.js')
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

  const pageData = ViewSelectAccountPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.accountSelected = payload.accountSelected

  return session.$update()
}

function _validate(payload) {
  const validationResult = ViewSelectAccountValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
