'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @module SubmitExistingAccountService
 */

const ExistingAccountPresenter = require('../../../presenters/billing-accounts/setup/existing-account.presenter.js')
const ExistingAccountValidator = require('../../../validators/billing-accounts/setup/existing-account.validator.js')
const FetchExistingCompaniesService = require('./fetch-existing-companies.service.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: _redirectUrl(session, payload)
    }
  }

  const companySearchResults = await FetchExistingCompaniesService.go(session.searchInput)

  const pageData = ExistingAccountPresenter.go(session, companySearchResults)

  return {
    error: validationResult,
    ...pageData
  }
}

function _redirectUrl(session, payload) {
  if (session.checkPageVisited && session.existingAccount === payload.existingAccount) {
    return `/system/billing-accounts/setup/${session.id}/check`
  }

  if (session.existingAccount === 'new') {
    return `/system/billing-accounts/setup/${session.id}/account-type`
  }

  return `/system/billing-accounts/setup/${session.id}/existing-address`
}

async function _save(session, payload) {
  if (session.existingAccount && session.existingAccount !== payload.existingAccount) {
    session.addressJourney = null
    session.addressSelected = null
    session.checkPageVisited = false
    session.fao = null
    session.contactSelected = null
    session.contactName = null

    if (payload.existingAccount !== 'new') {
      session.accountType = null
      session.companiesHouseNumber = null
      session.companySearch = null
      session.individualName = null
    }
  }

  session.existingAccount = payload.existingAccount

  return session.$update()
}

function _validate(payload) {
  const validationResult = ExistingAccountValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
