'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{billingAccountId}/account` page
 *
 * @module SubmitAccountService
 */

const SessionModel = require('../../../models/session.model.js')
const AccountPresenter = require('../../../presenters/billing-accounts/setup/account.presenter.js')
const AccountValidator = require('../../../validators/billing-accounts/setup/account.validator.js')

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{billingAccountId}/account` page
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

  const pageData = _submissionData(session, payload)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.accountSelected = payload.accountSelected
  session.searchInput = payload.accountSelected === 'another' ? payload.searchInput : null

  return session.$update()
}

function _submissionData(session, payload) {
  session.accountSelected = payload.accountSelected
  session.searchInput = payload.searchInput ?? null

  return AccountPresenter.go(session)
}

function _validate(payload) {
  const validationResult = AccountValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
