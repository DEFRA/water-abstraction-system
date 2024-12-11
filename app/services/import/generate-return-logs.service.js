'use strict'

/**
 * Generate the return logs for a changed imported licence
 * @module GenerateReturnLogsService
 */

const { determineEarliestDate } = require('../../lib/dates.lib.js')
const LicenceModel = require('../../models/licence.model.js')
const ProcessLicenceReturnLogsService = require('../return-logs/process-licence-return-logs.service.js')

/**
 * Determines if an imported licence has a changed end date.
 *
 * This service is responsible for determining whether a licence imported has a changed end date and therefore should
 * generate new return logs.
 *
 * @param {string} licenceId - The UUID of the licence being updated by the import
 * @param {object} importedLicence - The imported licence
 */
async function go(licenceId, importedLicence) {
  try {
    const { expiredDate, lapsedDate, revokedDate } = importedLicence
    const existingEarliestEndDate = await _fetchLicenceEndDate(licenceId)
    const earliestEndDate = determineEarliestDate([existingEarliestEndDate, expiredDate, lapsedDate, revokedDate])

    await ProcessLicenceReturnLogsService.go(licenceId, earliestEndDate)
  } catch (error) {
    global.GlobalNotifier.omfg('Generate return logs on import failed ', { licenceId }, error)
  }
}

async function _fetchLicenceEndDate(licenceId) {
  const { expiredDate, lapsedDate, revokedDate } = await LicenceModel.query()
    .select(['expiredDate', 'lapsedDate', 'revokedDate'])
    .where('id', licenceId)
    .first()

  const earliestDate = determineEarliestDate([expiredDate, lapsedDate, revokedDate])

  return earliestDate
}

module.exports = {
  go
}
