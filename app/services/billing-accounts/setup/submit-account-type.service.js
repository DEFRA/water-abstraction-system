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
 * @param {string} sessionId - The UUID of the current session
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
      redirectUrl: _redirectUrl(session)
    }
  }

  const pageData = _submissionData(session, payload)

  return {
    error: validationResult,
    ...pageData
  }
}

function _redirectUrl(session) {
  if (session.accountType === 'individual') {
    return `/system/billing-accounts/setup/${session.id}/existing-address`
  }

  return `/system/billing-accounts/setup/${session.id}/company-search`
}

async function _save(session, payload) {
  session.accountType = payload.accountType

  if (payload.accountType === 'company') {
    delete session.searchIndividualInput
  } else {
    session.searchIndividualInput = payload.searchIndividualInput
    delete session.companyName
  }

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
