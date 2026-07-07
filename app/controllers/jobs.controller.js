/**
 * Controller for /jobs endpoints
 * @module JobsController
 */

import http2 from 'node:http2'
import ExportService from '../services/jobs/export/export.service.js'
import ProcessCleanService from '../services/jobs/clean/process-clean.service.js'
import ProcessCustomerFilesService from '../services/jobs/customer-files/process-customer-files.service.js'
import ProcessLicenceUpdatesService from '../services/jobs/licence-updates/process-licence-updates.service.js'
import ProcessNotificationStatusService from '../services/jobs/notification-status/process-notification-status.service.js'
import ProcessRenewalInvitationsService from '../services/jobs/renewal-invitations/process-renewal-invitations.service.js'
import ProcessReturnLogsService from '../services/jobs/return-logs/process-return-logs.service.js'
import ProcessTimeLimitedLicencesService from '../services/jobs/time-limited/process-time-limited-licences.service.js'

const { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_NOT_FOUND } = http2.constants

async function clean(_request, h) {
  ProcessCleanService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function customerFiles(request, h) {
  const { days } = request.params

  ProcessCustomerFilesService.go(days)

  return h.response().code(HTTP_STATUS_NO_CONTENT)
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

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function licenceUpdates(_request, h) {
  ProcessLicenceUpdatesService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function notificationStatus(_request, h) {
  ProcessNotificationStatusService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function renewalInvitations(request, h) {
  const { days } = request.params

  ProcessRenewalInvitationsService.go(days)

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function returnLogs(request, h) {
  const { cycle } = request.params

  if (!['summer', 'all-year'].includes(cycle)) {
    return h.response().code(HTTP_STATUS_NOT_FOUND)
  }

  ProcessReturnLogsService.go(cycle)

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

async function timeLimited(_request, h) {
  ProcessTimeLimitedLicencesService.go()

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

export {
  clean,
  customerFiles,
  exportDb,
  licenceUpdates,
  notificationStatus,
  renewalInvitations,
  returnLogs,
  timeLimited
}
export default {
  clean,
  customerFiles,
  exportDb,
  licenceUpdates,
  notificationStatus,
  renewalInvitations,
  returnLogs,
  timeLimited
}
