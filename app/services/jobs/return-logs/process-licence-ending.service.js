'use strict'

/**
 * Process voiding and reissuing return logs when a licence ends
 * @module ProcessLicenceEndingService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const CreateReturnLogsService = require('./create-return-logs.service.js')
const FetchLicenceReturnRequirementsService = require('./fetch-licence-return-requirements.service.js')
const VoidReturnLogsService = require('./void-return-logs.service.js')
const GenerateReturnLogsService = require('./generate-return-logs.service.js')

/**
 * Voids and reiusses the return logs for the given licence from the date provided
 *
 * @param {string} [licenceReference] - An optional argument to limit return log creation to just the specific licence
 * @param {Date} [endDate] - The end date of the licence
 */
async function go (licenceReference, endDate) {
  try {
    const startTime = currentTimeInNanoseconds()

    await VoidReturnLogsService.go(licenceReference, endDate)
    const returnRequirements = await FetchLicenceReturnRequirementsService.go(licenceReference, endDate)
    console.log(returnRequirements)
    const returnLogs = await GenerateReturnLogsService.go(returnRequirements)
    console.log(returnLogs)

    await CreateReturnLogsService.go(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create licence return logs job complete', { licenceReference })
  } catch (error) {
    console.log(error)
    global.GlobalNotifier.omfg('Create licence return logs job failed', { error })
  }
}

module.exports = {
  go
}
