'use strict'

/**
 * Controller for /jobs endpoints
 * @module JobsController
 */

const ExportService = require('../services/jobs/export/export.service.js')
const ProcessLicenceUpdates = require('../services/jobs/licence-updates/process-licence-updates.js')
const ProcessSessionStorageCleanupService = require('../services/jobs/session-cleanup/process-session-storage-cleanup.service.js')
const ProcessTimeLimitedLicencesService = require('../services/jobs/time-limited/process-time-limited-licences.service.js')
const ProcessReturnLogsService = require('../services/jobs/return-logs/process-return-logs.service.js')

const redirectStatusCode = 204

/**
 * Triggers export of all relevant tables to CSV and then uploads them to S3
 *
 * > Has to be called something other than 'export' because export is a reserved word
 */
async function exportDb (_request, h) {
  ExportService.go()

  return h.response().code(redirectStatusCode)
}

async function licenceUpdates (_request, h) {
  ProcessLicenceUpdates.go()

  return h.response().code(redirectStatusCode)
}

async function sessionCleanup (_request, h) {
  ProcessSessionStorageCleanupService.go()

  return h.response().code(redirectStatusCode)
}

async function timeLimited (_request, h) {
  ProcessTimeLimitedLicencesService.go()

  return h.response().code(redirectStatusCode)
}

async function returnLogs (_request, h) {
  if (h.request.payload === null) {
    ProcessReturnLogsService.go(false, undefined)

    return h.response().code(redirectStatusCode)
  }

  const isSummer = !!h.request.payload.isSummer
  const { licenceReference } = h.request.payload

  ProcessReturnLogsService.go(isSummer, licenceReference)

  return h.response().code(redirectStatusCode)
}

module.exports = {
  exportDb,
  licenceUpdates,
  returnLogs,
  sessionCleanup,
  timeLimited
}
