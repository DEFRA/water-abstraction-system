'use strict'

/**
 * Generates the return logs for an imported licence
 * @module GenerateReturnLogsService
 */

const { determineEarliestDate } = require('../../lib/dates.lib.js')
const LicenceModel = require('../../models/licence.model.js')
// const DetermineLicenceEndDateChangedService = require('./determine-licence-end-date-changed.service.js')
// const ProcessLicenceReturnLogsService = require('../jobs/return-logs/process-licence-return-logs.service.js')
// const VoidReturnLogsService = require('../jobs/return-logs/void-return-logs.service.js')

/**
 * Determines if an imported licence has a changed end date.
 *
 * This service is responsible for determining whether a licence imported has a changed end date and therefore should
 * generate new return logs.
 *
 * @param {object} importedLicence - The imported licence
 * @param {string} licenceId - The UUID of the licence being updated by the import
 */
async function go(importedLicence, licenceId) {
  try {
    const { expiredDate, lapsedDate, revokedDate } = importedLicence
    const importedEarliestDate = determineEarliestDate(expiredDate, lapsedDate, revokedDate)
    const existingEarliestDate = _fetchLicenceEndDate(licenceId)
    const earliestDate = determineEarliestDate(importedEarliestDate, existingEarliestDate)

    if (importedEarliestDate !== null && earliestDate !== existingEarliestDate) {
      // If they are not the same then void the returns from the earliest date and generate new ones
      // await ProcessLicenceReturnLogsService.go(licenceId, earliestDate)
    } else {
      // If there is now no earliest date then void the last set of return logs and generate new ones
      // await VoidReturnLogsService.go(licenceId, existingEarliestDate)
      // await ProcessLicenceReturnLogsService.go(licenceId)
    }
  } catch (error) {
    global.GlobalNotifier.omfg('Generate return logs on import failed ', { licenceId }, error)
  }
}

async function _fetchLicenceEndDate(licenceId) {
  const { expiredDate, lapsedDate, revokedDate } = await LicenceModel.query()
    .select(['expiredDate', 'lapsedDate', 'revokedDate'])
    .where('id', licenceId)

  const earliestDate = determineEarliestDate(expiredDate, lapsedDate, revokedDate)

  return earliestDate
}

module.exports = {
  go
}
