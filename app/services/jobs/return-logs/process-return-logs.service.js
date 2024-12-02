'use strict'

/**
 * Determines what return logs need to be generated for a given cycle and creates them
 * @module ProcessReturnLogsService
 */

const {
  calculateAndLogTimeTaken,
  currentTimeInNanoseconds,
  timestampForPostgres
} = require('../../../lib/general.lib.js')
const CreateCurrentReturnCycleService = require('./create-current-return-cycle.service.js')
const FetchCurrentReturnCycleService = require('./fetch-current-return-cycle.service.js')
const FetchReturnRequirementsService = require('./fetch-return-requirements.service.js')
const GenerateReturnLogService = require('../../return-logs/generate-return-log.service.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')

/**
 * Determines what return logs need to be generated for a given cycle and creates them
 *
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
 * log created for the selected cycle and then creates them.
 *
 * @param {string} cycle - the return cycle to create logs for (summer or all-year)
 */
async function go(cycle) {
  try {
    const startTime = currentTimeInNanoseconds()

    const returnCycle = await _fetchReturnCycle(cycle)
    const returnRequirements = await FetchReturnRequirementsService.go(returnCycle)

    for (const returnRequirement of returnRequirements) {
      await _createReturnLog(returnRequirement, returnCycle)
    }

    calculateAndLogTimeTaken(startTime, 'Return logs job complete', { count: returnRequirements.length, cycle })
  } catch (error) {
    global.GlobalNotifier.omfg('Return logs job failed', { cycle }, error)
  }
}

async function _createReturnLog(returnRequirement, returnCycle) {
  try {
    const returnLog = GenerateReturnLogService.go(returnRequirement, returnCycle)
    const timestamp = timestampForPostgres()

    await ReturnLogModel.query().insert({ ...returnLog, createdAt: timestamp, updatedAt: timestamp })
  } catch (error) {
    global.GlobalNotifier.omfg('Return log creation errored', { returnRequirement }, error)
  }
}

async function _fetchReturnCycle(cycle) {
  const summer = cycle === 'summer'
  const returnCycle = await FetchCurrentReturnCycleService.go(summer)

  if (returnCycle) {
    return returnCycle
  }

  return CreateCurrentReturnCycleService.go(summer)
}

module.exports = {
  go
}
