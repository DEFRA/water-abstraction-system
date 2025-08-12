'use strict'

/**
 * Controller for /jobs endpoints
 * @module JobsController
 */

const ExportService = require('../services/jobs/export/export.service.js')
const ProcessCleanService = require('../services/jobs/clean/process-clean.service.js')
const ProcessCustomerFilesService = require('../services/jobs/customer-files/process-customer-files.service.js')
const ProcessLicenceUpdatesService = require('../services/jobs/licence-updates/process-licence-updates.service.js')
const ProcessNotificationsStatusUpdatesService = require('../services/jobs/notifications/notifications-status-updates.service.js')
const ProcessReturnLogsService = require('../services/jobs/return-logs/process-return-logs.service.js')
const ProcessTimeLimitedLicencesService = require('../services/jobs/time-limited/process-time-limited-licences.service.js')

const NO_CONTENT_STATUS_CODE = 204
const NOT_FOUND_STATUS_CODE = 404

async function clean(_request, h) {
  ProcessCleanService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function customerFiles(request, h) {
  const { days } = request.params

  ProcessCustomerFilesService.go(days)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

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

async function licenceUpdates(_request, h) {
  ProcessLicenceUpdatesService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function notificationsStatusUpdates(_request, h) {
  ProcessNotificationsStatusUpdatesService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function returnLogs(request, h) {
  const { cycle } = request.params

  if (!['summer', 'all-year'].includes(cycle)) {
    return h.response().code(NOT_FOUND_STATUS_CODE)
  }

  ProcessReturnLogsService.go(cycle)

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

async function timeLimited(_request, h) {
  ProcessTimeLimitedLicencesService.go()

  return h.response().code(NO_CONTENT_STATUS_CODE)
}

module.exports = {
  clean,
  customerFiles,
  exportDb,
  licenceUpdates,
  notificationsStatusUpdates,
  returnLogs,
  timeLimited
}
