'use strict'

/**
 * Controller for /licences/end-dates endpoints
 * @module LicencesEndDatesController
 */

const CheckAllLicenceEndDatesService = require('../services/licences/end-dates/check-all-licence-end-dates.service.js')
const ProcessLicenceEndDateChangesService = require('../services/licences/end-dates/process-licence-end-date-changes.service.js')

const NO_CONTENT_STATUS_CODE = 204

async function check(_request, h) {
  CheckAllLicenceEndDatesService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function process(_request, h) {
  ProcessLicenceEndDateChangesService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

module.exports = {
  check,
  process
}
