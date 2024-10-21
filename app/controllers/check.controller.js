'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const DetermineSupplementaryBillingFlagsService = require('../services/import/determine-supplementary-billing-flags.service.js')
const ProcessLicenceReturnLogsService = require('../services/jobs/return-logs/process-licence-return-logs.service.js')

const redirectStatusCode = 204

/**
 * A test end point for the licence supplementary billing flags process
 *
 * This endpoint takes a licenceId and licence expired, lapsed and revoked date. It passes this onto the
 * `DetermineSupplementaryBillingFlagsService` to test if it correctly flags the licence for supplementary billing. This
 * normally happens during the licence import process.
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function flagForBilling (request, h) {
  const { licenceId, expiredDate, lapsedDate, revokedDate } = request.payload

  const transformedLicence = {
    expiredDate,
    lapsedDate,
    revokedDate
  }

  DetermineSupplementaryBillingFlagsService.go(transformedLicence, licenceId)

  return h.response().code(204)
}

/**
 * A test end point to create return logs for a given licence reference
 *
 * @param _request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function returnLogsForLicence (_request, h) {
  let licenceReference

  if (h.request.payload !== null && h.request.payload.licenceReference) {
    licenceReference = h.request.payload.licenceReference
  } else {
    return h.response().code(404)
  }

  ProcessLicenceReturnLogsService.go(licenceReference)

  return h.response().code(redirectStatusCode)
}

module.exports = {
  flagForBilling,
  returnLogsForLicence
}
