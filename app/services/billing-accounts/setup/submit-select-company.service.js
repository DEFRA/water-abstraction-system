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
      redirectUrl: `/system/billing-accounts/setup/${session.id}/existing-address`
    }
  }

  const companies = await FetchCompaniesService.go(session.companySearch)
  const pageData = _submissionData(session, payload, companies)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.companiesHouseId = payload.companiesHouseId

  return session.$update()
}

function _submissionData(session, payload, companies) {
  session.companiesHouseId = payload.companiesHouseId

  return SelectCompanyPresenter.go(session, companies)
}

function _validate(payload) {
  const validationResult = SelectCompanyValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
