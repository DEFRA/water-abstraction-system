'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const ProcessLicenceEndingService = require('../services/jobs/return-logs/process-licence-ending.service.js')
const ProcessLicenceReturnLogsService = require('../services/jobs/return-logs/process-licence-return-logs.service.js')

const redirectStatusCode = 204

/**
 * A test end point to void and reissue return logs for a given licence reference from a given date
 *
 * @param _request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function returnLogsForEndedLicence (_request, h) {
  let licenceReference
  let endDate

  if (h.request.payload !== null && h.request.payload.licenceReference && h.request.payload.endDate
  ) {
    licenceReference = h.request.payload.licenceReference
    endDate = h.request.payload.endDate
  } else {
    return h.response().code(404)
  }

  ProcessLicenceEndingService.go(licenceReference, endDate)

  return h.response().code(redirectStatusCode)
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
  returnLogsForLicence
}
