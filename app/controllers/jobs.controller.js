'use strict'

/**
 * Controller for /jobs endpoints
 * @module JobsController
 */

const ExportService = require('../services/jobs/export/export.service.js')
const ProcessTimeLimitedLicencesService = require('../services/jobs/time-limited/process-time-limited-licences.service.js')

/**
 * Triggers export of all relevant tables to CSV and then uploads them to S3
 *
 * > Has to be called something other than 'export' because export is a reserved word
 */
async function exportDb (_request, h) {
  ExportService.go()

  return h.response().code(204)
}

async function timeLimited (request, h) {
  ProcessTimeLimitedLicencesService.go()

  return h.response().code(204)
}

module.exports = {
  exportDb,
  timeLimited
}
