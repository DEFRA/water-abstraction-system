'use strict'

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @module SubmitAccountTypeService
 */

const AccountTypePresenter = require('../../../presenters/billing-accounts/setup/account-type.presenter.js')
const AccountTypeValidator = require('../../../validators/billing-accounts/setup/account-type.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
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
      accountType: payload.accountType
    }
  }

  const pageData = _submissionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.accountType = payload.accountType
  session.searchIndividualInput = payload.accountType === 'individual' ? payload.searchIndividualInput : null

  return session.$update()
}

function _submissionData(session, payload) {
  session.accountType = payload.accountType
  session.searchInput = payload.searchIndividualInput ?? null

  return AccountTypePresenter.go(session)
}

function _validate(payload) {
  const validationResult = AccountTypeValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
