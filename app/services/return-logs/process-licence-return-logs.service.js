'use strict'

/**
 * Process voiding and reissuing return logs for a given licence reference
 * @module ProcessLicenceReturnLogsService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../lib/general.lib.js')
const CreateReturnLogsService = require('./create-return-logs.service.js')
const FetchReturnRequirementsService = require('./fetch-return-requirements.service.js')
const GenerateReturnLogService = require('./generate-return-log.service.js')
const ReturnCycleModel = require('../../models/return-cycle.model.js')
const VoidReturnLogsService = require('./void-return-logs.service.js')

/**
 * Process voiding and reissuing return logs for a given licence reference
 *
 * @param {string} licenceReference - The licence to create return logs for
 * @param {Date} [endDate] - An optional end date to use when determining which return logs to void and reissue
 */
async function go(licenceReference, endDate = null) {
  try {
    const startTime = currentTimeInNanoseconds()

    if (endDate) {
      await VoidReturnLogsService.go(licenceReference, endDate)
    } else {
      endDate = new Date()
    }

    const returnCycles = await _fetchReturnCycles(endDate)
    const returnLogs = []

    for (const returnCycle of returnCycles) {
      const returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licenceReference)

      for (const returnRequirement of returnRequirements) {
        const returnLog = GenerateReturnLogService.go(returnRequirement, returnCycle)

        returnLogs.push(returnLog)
      }
    }

    await CreateReturnLogsService.go(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create licence return logs job complete', { licenceReference })
  } catch (error) {
    global.GlobalNotifier.omfg('Create licence return logs job failed', { error })
  }
}

async function _fetchReturnCycles(endDate) {
  return ReturnCycleModel.query()
    .select(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
    .where('endDate', '>=', endDate)
    .orderBy('endDate', 'desc')
}

module.exports = {
  go
}
