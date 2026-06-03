'use strict'

/**
 * Orchestrates validating renewal notice types for the `/notices/setup/{sessionId}/licence` page
 * @module ProcessRenewalsNoticeLicenceSubmission
 */

const FetchRenewalLicenceDal = require('../../../../dal/notices/setup/fetch-renewal-licence.dal.js')
const LicenceRenewalValidator = require('../../../../validators/notices/setup/renewal-notice/licence-renewal.validator.js')
const { renewalNoticeDate } = require('../../../../lib/dates.lib.js')
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
  const licenceRenewal = await _licenceRenewal(payload)

  const validationResult = _validate(payload, licenceRenewal)

  return {
    additionalSessionData: _additionalSessionData(licenceRenewal),
    validationResult
  }
}

function _additionalSessionData(licenceRenewal) {
  if (licenceRenewal?.expiredDate) {
    return {
      expiryDate: licenceRenewal.expiredDate,
      renewalDate: renewalNoticeDate(licenceRenewal.expiredDate)
    }
  }

  return {}
}

async function _licenceRenewal(payload) {
  if (!payload.licenceRef) {
    return null
  }

  return await FetchRenewalLicenceDal.go(payload.licenceRef)
}

function _validate(payload, licenceRenewal) {
  const validationResult = LicenceRenewalValidator.go(payload, licenceRenewal)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
