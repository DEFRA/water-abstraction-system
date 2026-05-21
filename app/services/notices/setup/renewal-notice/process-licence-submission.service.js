'use strict'

/**
 * Orchestrates validating renewal notice types for the `/notices/setup/{sessionId}/licence` page
 * @module ProcessRenewalsNoticeLicenceSubmission
 */

const CheckLicenceExistsDal = require('../../../../dal/notices/setup/check-licence-exists.dal.js')
const FetchLicenceRenewalDal = require('../../../../dal/notices/setup/fetch-renewal-licence.dal.js')
const LicenceRenewalValidator = require('../../../../validators/notices/setup/renewal-notice/licence-renewal.validator.js')
const ProcessRenewalDates = require('./process-renewal-dates.service.js')
const { formatValidationResult } = require('../../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the renewal notice types for the `/notices/setup/{sessionId}/licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return the same error.
 *
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The validation result (null if valid)
 */
async function go(payload) {
  const { expiryDate, renewalDate } = ProcessRenewalDates.go()

  const validationResult = await _validate(payload, expiryDate)

  return {
    additionalSessionData: {
      expiryDate,
      renewalDate
    },
    validationResult
  }
}

async function _validate(payload, expiryDate) {
  let licenceExists = false
  let licenceRenewal = false

  if (payload.licenceRef) {
    licenceExists = await CheckLicenceExistsDal.go(payload.licenceRef)
  }

  if (licenceExists) {
    licenceRenewal = await FetchLicenceRenewalDal.go(payload.licenceRef)
  }

  const validationResult = LicenceRenewalValidator.go(payload, licenceExists, licenceRenewal, expiryDate)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
