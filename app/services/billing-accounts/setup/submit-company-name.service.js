'use strict'

/**
 * Orchestrates validating the data for the '/billing-accounts/setup/{sessionId}/company-name' page
 *
 * @module SubmitCompanyNameService
 */

const CompanyNamePresenter = require('../../../presenters/billing-accounts/setup/company-name.presenter.js')
const CompanyNameValidator = require('../../../validators/billing-accounts/setup/company-name.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/billing-accounts/setup/{sessionId}/company-name' page
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
  session.companyName = payload.companyName

  return session.$update()
}

function _submissionData(session, payload) {
  session.companyName = payload.companyName

  return CompanyNamePresenter.go(session)
}

function _validate(payload) {
  const validationResult = CompanyNameValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
