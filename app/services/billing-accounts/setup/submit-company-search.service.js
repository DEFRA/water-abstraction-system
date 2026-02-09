'use strict'

/**
 * Orchestrates validating the data for the '/billing-accounts/setup/{sessionId}/company-search' page
 *
 * @module SubmitCompanySearchService
 */

const CompanySearchPresenter = require('../../../presenters/billing-accounts/setup/company-search.presenter.js')
const CompanySearchValidator = require('../../../validators/billing-accounts/setup/company-search.validator.js')
const SessionModel = require('../../../models/session.model.js')
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
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: `/system/billing-accounts/setup/${session.id}/select-company`
    }
  }

  const pageData = _submissionData(session, payload)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
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
