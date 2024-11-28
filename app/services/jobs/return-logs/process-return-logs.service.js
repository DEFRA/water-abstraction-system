'use strict'

/**
 * Determines what return logs need to be generated for a given cycle and creates them
 * @module ProcessReturnLogsService
 */

const CreateReturnLogsService = require('../../return-logs/create-return-logs.service.js')
const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const FetchReturnCycleService = require('./fetch-return-cycle.service.js')
const FetchReturnRequirementsService = require('../../return-logs/fetch-return-requirements.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const GenerateReturnCycleService = require('./generate-return-cycle.service.js')
const GenerateReturnLogsService = require('../../return-logs/generate-return-logs.service.js')

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
    const summer = cycle === 'summer'

    const returnCycle = await _fetchReturnCycleIds(summer)
    const returnRequirements = await FetchReturnRequirementsService.go(returnCycle)

    const returnLogs = []

    for (const returnRequirement of returnRequirements) {
      const returnLog = await GenerateReturnLogsService.go(returnRequirement, returnCycle)

      returnLogs.push(returnLog)
    }

    await CreateReturnLogsService.go(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Return logs job complete', { cycle })
  } catch (error) {
    global.GlobalNotifier.omfg('Return logs job failed', { cycle, error })
  }
}

async function _fetchReturnCycleIds(summer) {
  const today = formatDateObjectToISO(new Date())

  let returnCycle = await FetchReturnCycleService.go(today, summer)

  if (!returnCycle) {
    returnCycle = await GenerateReturnCycleService.go(summer)
  }

  return returnCycle
}

module.exports = {
  go
}
