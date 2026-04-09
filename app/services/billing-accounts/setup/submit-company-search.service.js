'use strict'

/**
 * Orchestrates validating the data for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @module SubmitCompanySearchService
 */

const CompanySearchPresenter = require('../../../presenters/billing-accounts/setup/company-search.presenter.js')
const CompanySearchValidator = require('../../../validators/billing-accounts/setup/company-search.validator.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @param {string} sessionId - The UUID of the current session
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

  return `/system/billing-accounts/setup/${session.id}/select-company`
}

async function _save(session, payload) {
  if (session.checkPageVisited && session.companySearch !== payload.companySearch) {
    session.addressJourney = null
    session.addressSelected = null
    session.checkPageVisited = false
    session.companiesHouseNumber = false
    session.fao = null
    session.contactSelected = null
    session.contactName = null
  }

  session.companySearch = payload.companySearch

  return session.$update()
}

function _submissionData(session, payload) {
  session.companySearch = payload.companySearch

  return CompanySearchPresenter.go(session)
}

function _validate(payload) {
  const validationResult = CompanySearchValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
