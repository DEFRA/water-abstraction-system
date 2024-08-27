'use strict'

/**
 * Process the return logs for the next cycle
 * @module ProcessReturnLogsService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const FetchReturnLogsService = require('./fetch-return-logs.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Creates the return logs for the next cycle
 * @param {string} cycle - the return cycle
 * @param {string} licenceReference - The licence reference to have return logs created
 */
async function go (cycle, licenceReference) {
  try {
    const startTime = currentTimeInNanoseconds()
    const isSummer = cycle === 'summer'
    const returnLogs = await FetchReturnLogsService.go(isSummer, licenceReference)

    await _createReturnLogs(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create return logs job complete', { cycle, licenceReference })
  } catch (error) {
    global.GlobalNotifier.omfg('Create return logs job failed', cycle, error)
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
