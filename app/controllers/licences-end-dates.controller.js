'use strict'

/**
 * Controller for /licences/end-dates endpoints
 * @module LicencesEndDatesController
 */

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

const CheckAllLicenceEndDatesService = require('../services/licences/end-dates/check-all-licence-end-dates.service.js')
const ProcessLicenceEndDateChangesService = require('../services/licences/end-dates/process-licence-end-date-changes.service.js')

async function check(_request, h) {
  CheckAllLicenceEndDatesService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function process(_request, h) {
  ProcessLicenceEndDateChangesService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

module.exports = {
  check,
  process
}
