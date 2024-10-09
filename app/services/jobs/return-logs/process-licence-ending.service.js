'use strict'

/**
 * Process voiding and reissuing return logs when a licence ends
 * @module ProcessLicenceEndingService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const FetchLicenceReturnLogsService = require('./fetch-licence-return-requirements.service.js')
const VoidReturnLogsService = require('./void-return-logs.service.js')
const GenerateReturnLogsService = require('./generate-return-logs.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Voids and reiusses the return logs for the given licence from the date provided
 *
 * @param {string} [licenceReference] - An optional argument to limit return log creation to just the specific licence
 * @param {date} [date] - The end date of the licence
 */
async function go (licenceReference, date) {
  try {
    const startTime = currentTimeInNanoseconds()

    await VoidReturnLogsService.go(licenceReference, date)

    await _createReturnLogs(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create licence return logs job complete', { licenceReference })
  } catch (error) {
    global.GlobalNotifier.omfg('Create licence return logs job failed', { error })
  }
}

async function _createReturnLogs (returnLogs) {
  for (const returnLog of returnLogs) {
    await ReturnLogModel.query()
      .insert(returnLog)
  }
}

module.exports = {
  go
}
