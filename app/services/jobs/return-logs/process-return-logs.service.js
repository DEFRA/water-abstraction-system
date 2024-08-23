'use strict'

/**
 * Creates the return logs for the next cycle
 * @module CreateReturnLogsService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const CreateReturnLogsService = require('./create-return-logs.service.js')
const FetchReturnLogsService = require('./fetch-return-logs.service.js')

/**
 * Creates the return logs for the next cycle
 */
async function go (isSummer, licenceReference) {
  try {
    const startTime = currentTimeInNanoseconds()
    const returnLogs = await FetchReturnLogsService.go(isSummer, licenceReference)

    if (returnLogs.length > 0) {
      await CreateReturnLogsService.go(returnLogs)
    }
    calculateAndLogTimeTaken(startTime, 'Process return logs complete', { isSummer, licenceReference })
  } catch (error) {
    global.GlobalNotifier.omfg('Create return logs job failed', null, error)
  }
}

module.exports = {
  go
}
