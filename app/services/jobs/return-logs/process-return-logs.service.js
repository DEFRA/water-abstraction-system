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
 * The return requirement is the information held against the licence that defines how and when an abstractor needs to
 * submit their returns.
 *
 * The return log is the 'header' record generated each return cycle from the requirement that an abstractor submits
 * their returns against.
 *
 * When users make changes to return requirements, the service will determine if any new return logs need to be
 * created depending on the current cycle.
 *
 * But if no changes are ever made to a licence's return requirements, and this job didn't exist, no new return logs
 * would be created.
 *
 * So, this job will run twice yearly: once for each cycle. The job determines which return requirements need a return
 * log generated for the selected cycle and then creates them.
 *
 * > Because the job creates _all_ return logs in a cycle, it makes it difficult to test what it is generating is
 * > correct. So, to support testing and validation, we can pass a licence ref in the job request to limit the creation
 * > to just a single licence.
 * @param {string} cycle - the return cycle to create logs for (summer or all-year)
 * @param {string} [licenceReference] - An optional argument to limit return log creation to just the specific licence
 */
async function go (cycle, licenceReference = null) {
  try {
    const startTime = currentTimeInNanoseconds()
    const isSummer = cycle === 'summer'
    const returnLogs = await FetchReturnLogsService.go(isSummer, licenceReference)

    await _createReturnLogs(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create return logs job complete', { cycle, licenceReference })
  } catch (error) {
    console.log(error)
    global.GlobalNotifier.omfg('Create return logs job failed', { cycle, error })
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
