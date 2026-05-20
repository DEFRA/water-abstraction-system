'use strict'

/**
 * Orchestrates validating the data for the returns notice types on the `/notices/setup/{sessionId}/licence` page
 * @module SubmitReturnsLicenceService
 */

const FetchDueReturnsForLicenceService = require('../returns-notice/fetch-due-returns-for-licence.service.js')
const FetchLicenceExistsDal = require('../../../../dal/licences/fetch-licence-exists.dal.js')
const LicenceDueReturnsValidator = require('../../../../validators/notices/setup/licence-due-returns.validator.js')
const { formatValidationResult } = require('../../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the returns notice types on the `/notices/setup/{sessionId}/licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return an the same error.
 * We then fetch all the due returns for the licence.
 * If there are no due returns then we return an error to the user informing them that there are no due returns the
 * licence.
 *
 * @param {object} session - The current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An empty object if there are no errors else the page data for the licence page including
 * the validation error details
 */
async function go(session, payload) {
  const dueReturns = await _dueReturns(payload)

  const validationResult = await _validate(payload, dueReturns)

  return {
    additionalSessionData: { dueReturns },
    validationResult
  }
}

async function _dueReturns(payload) {
  if (!payload.licenceRef) {
    return []
  }

  return FetchDueReturnsForLicenceService.go(payload.licenceRef)
}

async function _validate(payload, dueReturns) {
  let licenceExists = false

  if (payload.licenceRef) {
    licenceExists = await FetchLicenceExistsDal.go(payload.licenceRef)
  }

  const dueReturnsExist = dueReturns.length > 0

  const validationResult = LicenceDueReturnsValidator.go(payload, licenceExists, dueReturnsExist)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
