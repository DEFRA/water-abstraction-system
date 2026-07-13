/**
 * Orchestrates validating returns notice types for the `/notices/setup/{sessionId}/licence` page
 * @module ProcessReturnsNoticeLicenceSubmission
 */

import CheckLicenceExistsDal from '../../../../dal/notices/setup/check-licence-exists.dal.js'
import FetchDueReturnsForLicenceService from '../returns-notice/fetch-due-returns-for-licence.service.js'
import LicenceDueReturnsValidator from '../../../../validators/notices/setup/returns-notice/licence-due-returns.validator.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the returns notice types for the `/notices/setup/{sessionId}/licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return the same error.
 * We then fetch all the due returns for the licence.
 * If there are no due returns then we return an error to the user informing them that there are no due returns for the
 * licence.
 *
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The due returns fetched alongside the validation result (null if valid)
 */
export default async function (payload) {
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

  return FetchDueReturnsForLicenceService(payload.licenceRef)
}

async function _validate(payload, dueReturns) {
  const dueReturnsExist = dueReturns.length > 0

  let licenceExists = false

  if (payload.licenceRef) {
    licenceExists = await CheckLicenceExistsDal(payload.licenceRef)
  }

  const validationResult = LicenceDueReturnsValidator(payload, licenceExists, dueReturnsExist)

  return formatValidationResult(validationResult)
}
