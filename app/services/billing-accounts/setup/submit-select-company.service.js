'use strict'

/**
 * Orchestrates validating the data for the '/billing-accounts/setup/{sessionId}/select-company' page
 *
 * @module SubmitSelectCompanyService
 */

const FetchCompaniesService = require('./fetch-companies.service.js')
const SelectCompanyPresenter = require('../../../presenters/billing-accounts/setup/select-company.presenter.js')
const SelectCompanyValidator = require('../../../validators/billing-accounts/setup/select-company.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/billing-accounts/setup/{sessionId}/select-company' page
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

  const companies = await FetchCompaniesService.go(session.companySearch)
  const pageData = _submissionData(session, payload, companies)

  return {
    error: validationResult,
    ...pageData
  }
}

function _redirectUrl(session) {
  if (session.checkPageVisited) {
    return `/system/billing-accounts/setup/${session.id}/check`
  }

  return `/system/billing-accounts/setup/${session.id}/existing-address`
}

async function _save(session, payload) {
  if (session.companiesHouseNumber !== payload.companiesHouseNumber) {
    session.addressJourney = null
    session.addressSelected = null
    session.checkPageVisited = false
    session.fao = null
    session.contactSelected = null
    session.contactName = null
  }

  session.companiesHouseNumber = payload.companiesHouseNumber

  return session.$update()
}

function _submissionData(session, payload, companies) {
  session.companiesHouseNumber = payload.companiesHouseNumber

  return SelectCompanyPresenter.go(session, companies)
}

function _validate(payload) {
  const validationResult = SelectCompanyValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
