'use strict'

/**
 * Controller for /charge-elements endpoints
 * @module ChargeElementsController
 */

const ProcessTimeLimitedLicencesService = require('../services/charge-elements/process-time-limited-licences.service.js')

async function workflowTimeLimitedLicences (request, h) {
  ProcessTimeLimitedLicencesService.go()

  return h.response().code(204)
}

module.exports = {
  workflowTimeLimitedLicences
}
