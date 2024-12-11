'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const ProcessBillingFlagService = require('../../app/services/licences/supplementary/process-billing-flag.service.js')
const ProcessLicenceReturnLogsService = require('../services/return-logs/process-licence-return-logs.service.js')

const NO_CONTENT_STATUS_CODE = 204

/**
 * A test end point for the licence supplementary billing flags process
 *
 * This endpoint takes a licenceId and an expired, lapsed and revoked date. It passes this onto the
 * `DetermineSupplementaryBillingFlagsService` to test if it correctly flags the licence for supplementary billing. This
 * normally happens during the licence import process.
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function flagForBilling(request, h) {
  const { licenceId, expiredDate, lapsedDate, revokedDate } = request.payload

  const payload = {
    expiredDate: expiredDate ? new Date(expiredDate) : null,
    lapsedDate: lapsedDate ? new Date(lapsedDate) : null,
    licenceId,
    revokedDate: revokedDate ? new Date(revokedDate) : null
  }

  await ProcessBillingFlagService.go(payload)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

/**
 * A test end point to create return logs for a given licence reference
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function licenceReturnLogs(request, h) {
  const { licenceId } = request.params

  await ProcessLicenceReturnLogsService.go(licenceId)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

module.exports = {
  flagForBilling,
  licenceReturnLogs
}
