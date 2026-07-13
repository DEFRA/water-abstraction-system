/**
 * Orchestrates validating the data for `/billing-accounts/setup/{billingAccountId}/account` page
 *
 * @module SubmitAccountService
 */

import AccountPresenter from '../../../presenters/billing-accounts/setup/account.presenter.js'
import AccountValidator from '../../../validators/billing-accounts/setup/account.validator.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

import { formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{billingAccountId}/account` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function submitAccountService(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

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
      session.individualName = null
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

  return AccountPresenter(session)
}

function _validate(payload) {
  const validationResult = AccountValidator(payload)

  return formatValidationResult(validationResult)
}
