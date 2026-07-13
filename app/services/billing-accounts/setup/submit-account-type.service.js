/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @module SubmitAccountTypeService
 */

import AccountTypePresenter from '../../../presenters/billing-accounts/setup/account-type.presenter.js'
import AccountTypeValidator from '../../../validators/billing-accounts/setup/account-type.validator.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function submitAccountTypeService(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

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
  if (session.checkPageVisited) {
    return `/system/billing-accounts/setup/${session.id}/check`
  }

  if (session.accountType === 'individual') {
    return `/system/billing-accounts/setup/${session.id}/existing-address`
  }

  return `/system/billing-accounts/setup/${session.id}/company-search`
}

async function _save(session, payload) {
  const accountTypeExists = !!session.accountType
  const sameAccountType = session.accountType === payload.accountType
  const sameSearchInput = (session.individualName ?? null) === (payload.individualName ?? null)

  session.accountType = payload.accountType
  session.individualName = payload.individualName ?? null

  if (accountTypeExists && (!sameAccountType || !sameSearchInput)) {
    session.addressJourney = null
    session.addressSelected = null
    session.checkPageVisited = false
    session.fao = null
    session.contactSelected = null
    session.contactName = null

    if (payload.accountType === 'individual') {
      session.companiesHouseNumber = null
      session.companySearch = null
      session.individualName = payload.individualName
    } else {
      session.individualName = null
    }
  }

  return session.$update()
}

function _submissionData(session, payload) {
  session.accountType = payload.accountType
  session.individualName = payload.accountType === 'individual' ? payload.individualName : null

  return AccountTypePresenter(session)
}

function _validate(payload) {
  const validationResult = AccountTypeValidator(payload)

  return formatValidationResult(validationResult)
}
