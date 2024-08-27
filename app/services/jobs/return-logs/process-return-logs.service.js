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
 */
async function go (cycle, licenceReference) {
  try {
    const isSummer = cycle === 'summer'
    const startTime = currentTimeInNanoseconds()
    const returnLogs = await FetchReturnLogsService.go(isSummer, licenceReference)

    if (returnLogs.length > 0) {
      await _createReturnLogs(returnLogs)
    }
    calculateAndLogTimeTaken(startTime, 'Create return logs complete', { isSummer, licenceReference })
  } catch (error) {
    global.GlobalNotifier.omfg('Create return logs job failed', null, error)
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
