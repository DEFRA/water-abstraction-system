'use strict'

/**
 * Controller for /licences/end-dates endpoints
 * @module LicencesEndDatesController
 */

const ProcessLicenceChanges = require('../services/licences/end-dates/process-licence-changes.service.js')

const NO_CONTENT_STATUS_CODE = 204

async function check(_request, h) {
  ProcessLicenceChanges.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

module.exports = {
  check
}
