'use strict'

/**
 * Process the return logs for the next cycle
 * @module ProcessReturnLogsService
 */

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')
const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const CreateReturnLogsService = require('../../return-logs/create-return-logs.service.js')
const FetchReturnCycleService = require('./fetch-return-cycle.service.js')
const FetchReturnRequirementsService = require('../../return-logs/fetch-return-requirements.service.js')
const GenerateReturnCycleService = require('./generate-return-cycle.service.js')
const GenerateReturnLogsService = require('../../return-logs/generate-return-logs.service.js')

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
async function go(cycle, licenceReference) {
  try {
    const startTime = currentTimeInNanoseconds()
    const summer = cycle === 'summer'

    const returnCycle = await _fetchReturnCycleIds(summer)
    const returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licenceReference)

    const returnLogs = []

    for (const returnRequirement of returnRequirements) {
      const returnLog = await GenerateReturnLogsService.go(returnRequirement, returnCycle)

      returnLogs.push(returnLog)
    }

    await CreateReturnLogsService.go(returnLogs)

    calculateAndLogTimeTaken(startTime, 'Create return logs job complete', { cycle, licenceReference })
  } catch (error) {
    global.GlobalNotifier.omfg('Create return logs job failed', { cycle, error })
  }
}

async function _fetchReturnCycleIds(summer) {
  const today = formatDateObjectToISO(new Date())

  if (summer) {
    let summerReturnCycle = await FetchReturnCycleService.go(today, true)

    if (!summerReturnCycle) {
      summerReturnCycle = await GenerateReturnCycleService.go(true)
    }

    return summerReturnCycle
  }

  let allYearReturnCycle = await FetchReturnCycleService.go(today, false)

  if (!allYearReturnCycle) {
    allYearReturnCycle = await GenerateReturnCycleService.go(false)
  }

  return allYearReturnCycle
}

module.exports = {
  go
}
