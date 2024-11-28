'use strict'

/**
 * Process voiding and issuing return logs for a given licence reference
 * @module ProcessLicenceReturnLogsService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../lib/general.lib.js')
const CreateReturnLogsService = require('./create-return-logs.service.js')
const FetchReturnCyclesService = require('./fetch-return-cycles.service.js')
const FetchReturnRequirementsService = require('./fetch-return-requirements.service.js')
const GenerateReturnLogsService = require('./generate-return-logs.service.js')
const VoidReturnLogsService = require('./void-return-logs.service.js')

/**
 * Process voiding and issuing return logs for a given licence reference
 *
 * @param {string} licenceReference - The licence to create return logs for
 * @param {Date} [endDate] - An optional end date to use when determining which return logs to void and reissue
 */
async function go(licenceReference, endDate = null) {
  try {
    const startTime = currentTimeInNanoseconds()
    let returnCycles = []

    if (endDate) {
      await VoidReturnLogsService.go(licenceReference, endDate)
      returnCycles = await FetchReturnCyclesService.go(endDate)
    } else {
      returnCycles = await FetchReturnCyclesService.go(new Date())
    }

    const returnLogs = []

    for (const returnCycle of returnCycles) {
      const returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licenceReference)

      for (const returnRequirement of returnRequirements) {
        const returnLog = await GenerateReturnLogsService.go(returnRequirement, returnCycle)

        returnLogs.push(returnLog)
      }
    }

    await CreateReturnLogsService.go(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create licence return logs job complete', { licenceReference })
  } catch (error) {
    global.GlobalNotifier.omfg('Create licence return logs job failed', { error })
  }
}

module.exports = {
  go
}
