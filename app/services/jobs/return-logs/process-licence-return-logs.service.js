'use strict'

/**
 * Process the return logs for the given licence reference
 * @module ProcessLicenceReturnLogsService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const FetchLicenceReturnLogsService = require('./fetch-licence-return-requirements.service.js')
const GenerateReturnLogsService = require('./generate-return-logs.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Creates the return logs for the given licence
 * The return requirement is the information held against the licence that defines how and when an abstractor needs to
 * submit their returns.
 *
 * The return log is the 'header' record generated each return cycle from the requirement that an abstractor submits
 * their returns against.
 *
 * When users make changes to return requirements, the service will determine if any new return logs need to be
 * created depending on the current cycle.
 *
 * This service is for use when a new licence version is detected
 *
 * @param {string} [licenceReference] - An optional argument to limit return log creation to just the specific licence
 */
async function go (licenceReference) {
  try {
    const startTime = currentTimeInNanoseconds()
    const returnRequirements = await FetchLicenceReturnLogsService.go(licenceReference)
    const returnLogs = await GenerateReturnLogsService.go(returnRequirements)

    await _createReturnLogs(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create licence return logs job complete', { licenceReference })
  } catch (error) {
    console.log(error)
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
