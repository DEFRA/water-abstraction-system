/**
 * Controller for /licences/end-dates endpoints
 * @module LicencesEndDatesController
 */

import http2 from 'node:http2'
import CheckAllLicenceEndDatesService from '../services/licences/end-dates/check-all-licence-end-dates.service.js'
import ProcessLicenceEndDateChangesService from '../services/licences/end-dates/process-licence-end-date-changes.service.js'

const { HTTP_STATUS_NO_CONTENT } = http2.constants

async function check(_request, h) {
  CheckAllLicenceEndDatesService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function process(_request, h) {
  ProcessLicenceEndDateChangesService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

export {
  check,
  process
}
export default {
  check,
  process
}
