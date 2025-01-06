'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const ProcessBillingFlagService = require('../../app/services/licences/supplementary/process-billing-flag.service.js')
const ProcessLicenceReturnLogsService = require('../services/return-logs/process-licence-return-logs.service.js')

const NO_CONTENT_STATUS_CODE = 204

/**
 * A test end point for checking licences with changed end dates on import are flagged for supplementary billing
 *
 * This endpoint takes a licenceId and 'changeDate'. It passes this onto the
 * `ProcessBillingFlagService` to test if it correctly flags the licence for supplementary billing. This would normally
 * be done as part of `/jobs/licence-changes`. But that checks all licences and is driven by comparing NALD and WRLS.
 *
 * This endpoint allows us to test a licence in isolation, with a 'change date' of our choosing.
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function flagForBilling(request, h) {
  const { licenceId, changeDate } = request.payload

  await ProcessBillingFlagService.go({ licenceId, changeDate: new Date(changeDate) })

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

/**
 * A test end point for checking we correctly reissue the return logs for a given licence
 *
 * We always expect a `licenceId` and an optional `changeDate` to be passed in the request. If a `changeDate` is not
 * provided, the current date will be used.
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function licenceReturnLogs(request, h) {
  const { licenceId, changeDate } = request.payload

  await ProcessLicenceReturnLogsService.go(licenceId, changeDate ? new Date(changeDate) : null)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

module.exports = {
  flagForBilling,
  licenceReturnLogs
}
