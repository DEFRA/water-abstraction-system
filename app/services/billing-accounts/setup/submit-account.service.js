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
      redirectUrl: _redirectUrl(session, payload)
    }
  }

  const pageData = _submissionData(session, payload)

  return {
    error: validationResult,
    ...pageData
  }
}

function _redirectUrl(session, payload) {
  const searchInput = payload.searchInput ?? null

  if (
    session.checkPageVisited &&
    session.accountSelected === payload.accountSelected &&
    session.searchInput === searchInput
  ) {
    return `/system/billing-accounts/setup/${session.id}/check`
  }

  if (session.accountSelected === 'another') {
    return `/system/billing-accounts/setup/${session.id}/existing-account`
  }

  return `/system/billing-accounts/setup/${session.id}/existing-address`
}

async function _save(session, payload) {
  const differentSearchInput = session.searchInput !== payload.searchInput
  const selectedDifferentRadioOption = session.accountSelected !== payload.accountSelected
  const selectedAnotherButChangedSearch = payload.accountSelected === 'another' && differentSearchInput

  if (session.accountSelected && (selectedDifferentRadioOption || selectedAnotherButChangedSearch)) {
    session.addressJourney = null
    session.checkPageVisited = false
    session.fao = null
    session.contactSelected = null
    session.contactName = null

    if (payload.accountSelected === 'another') {
      session.addressSelected = null
    } else {
      session.accountType = null
      session.companiesHouseNumber = null
      session.companySearch = null
      session.existingAccount = null
      session.searchIndividualInput = null
    }
  }

  if (payload.accountSelected === 'another') {
    session.accountSelected = 'another'
    session.searchInput = payload.searchInput
  } else {
    session.accountSelected = session.billingAccount.company.id
    session.searchInput = null
  }

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
