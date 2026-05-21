'use strict'

/**
 * Orchestrates validating renewal notice types for the `/notices/setup/{sessionId}/licence` page
 * @module ProcessRenewalsNoticeLicenceSubmission
 */

const CheckLicenceExistsDal = require('../../../../dal/notices/setup/check-licence-exists.dal.js')
const LicenceRenewalValidator = require('../../../../validators/notices/setup/renewal-notice/licence-renewal.validator.js')
const { formatValidationResult } = require('../../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the renewal notice types for the `/notices/setup/{sessionId}/licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return the same error.
 *
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The due returns fetched alongside the validation result (null if valid)
 */
async function go(payload) {
  const validationResult = await _validate(payload)

  return {
    additionalSessionData: {},
    validationResult
  }
}

async function _validate(payload) {
  let licenceExists = false

  if (payload.licenceRef) {
    licenceExists = await CheckLicenceExistsDal.go(payload.licenceRef)
  }

  const validationResult = LicenceRenewalValidator.go(payload, licenceExists)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
