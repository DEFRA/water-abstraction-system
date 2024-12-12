'use strict'

/**
 * Generates and persists return logs for the given return requirement and cycle
 * @module CreateReturnLogsService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const GenerateReturnLogService = require('./generate-return-log.service.js')
const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Generates and persists return logs for the given return requirement and cycle
 *
 * @param {module:ReturnRequirementModel} returnRequirement - the return requirement to generate return logs for
 * @param {module:ReturnCycleModel} returnCycle - the return cycle to generate return logs against
 *
 * @returns {Promise<string[]>} an array of the generated return log ids
 */
async function go(returnRequirement, returnCycle) {
  try {
    const returnLogs = _generateReturnLogs(returnRequirement, returnCycle)

    await _persistReturnLogs(returnLogs)

    return returnLogs.map((returnLog) => {
      return returnLog.id
    })
  } catch (error) {
    global.GlobalNotifier.omfg('Return logs creation errored', { returnRequirement, returnCycle }, error)
  }
}

/**
 * NOTE: At this time we will only ever generate a single return log from a return requirement. But our very next task
 * is to amend this functionality to support quarterly returns. When we do that will oblige us to generate multiple
 * return logs from a single return requirement, if that requirement is linked to a return version flagged as quarterly.
 *
 * This is where that change will happen, and we can save ourselves some time and unnecessary refactoring if everything
 * we do after this point assumes multiple return logs are being generated for creation.
 *
 * @private
 */
function _generateReturnLogs(returnRequirement, returnCycle) {
  const returnLog = GenerateReturnLogService.go(returnRequirement, returnCycle)

  return [returnLog]
}

async function _persistReturnLogs(returnLogs) {
  for (const returnLog of returnLogs) {
    const timestamp = timestampForPostgres()

    await ReturnLogModel.query()
      .insert({ ...returnLog, createdAt: timestamp, updatedAt: timestamp })
      .onConflict(['id'])
      .ignore()
  }
}

module.exports = {
  go
}
