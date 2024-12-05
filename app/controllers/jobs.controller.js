'use strict'

/**
 * Controller for /jobs endpoints
 * @module JobsController
 */

const ExportService = require('../services/jobs/export/export.service.js')
const ImportLicence = require('../services/jobs/import/import-licences.service.js')
const ProcessLicenceUpdates = require('../services/jobs/licence-updates/process-licence-updates.js')
const ProcessReturnLogsService = require('../services/jobs/return-logs/process-return-logs.service.js')
const ProcessSessionStorageCleanupService = require('../services/jobs/session-cleanup/process-session-storage-cleanup.service.js')
const ProcessTimeLimitedLicencesService = require('../services/jobs/time-limited/process-time-limited-licences.service.js')

const NO_CONTENT_STATUS_CODE = 204
const NOT_FOUND_STATUS_CODE = 404

/**
 * Triggers export of all relevant tables to CSV and then uploads them to S3
 *
 * > Has to be called something other than 'export' because export is a reserved word
 * @param _request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function exportDb(_request, h) {
  ExportService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function ImportLicences(_request, h) {
  ImportLicence.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function licenceUpdates(_request, h) {
  ProcessLicenceUpdates.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function sessionCleanup(_request, h) {
  ProcessSessionStorageCleanupService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function timeLimited(_request, h) {
  ProcessTimeLimitedLicencesService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function returnLogs(request, h) {
  const { cycle } = request.params

  if (!['summer', 'all-year'].includes(cycle)) {
    return h.response().code(NOT_FOUND_STATUS_CODE)
  }

  let licenceReference

  if (h.request.payload !== null && h.request.payload.licenceReference) {
    licenceReference = h.request.payload.licenceReference
  }

  ProcessReturnLogsService.go(cycle, licenceReference)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

module.exports = {
  exportDb,
  ImportLicences,
  licenceUpdates,
  returnLogs,
  sessionCleanup,
  timeLimited
}
