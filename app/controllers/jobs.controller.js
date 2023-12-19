'use strict'

/**
 * Controller for /jobs endpoints
 * @module JobsController
 */

const ProcessTimeLimitedLicencesService = require('../services/jobs/time-limited/process-time-limited-licences.service.js')

async function timeLimited (request, h) {
  ProcessTimeLimitedLicencesService.go()

  return h.response().code(204)
}

module.exports = {
  timeLimited
}
