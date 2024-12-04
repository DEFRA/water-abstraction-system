'use strict'

/**
 * Process voiding and reissuing return logs for a given licence reference
 * @module ProcessLicenceReturnLogsService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const FetchLicenceReturnRequirementsService = require('./fetch-licence-return-requirements.service.js')
const GenerateReturnLogService = require('./generate-return-log.service.js')
const ReturnCycleModel = require('../../models/return-cycle.model.js')
const ReturnLogModel = require('../../models/return-log.model.js')
const VoidLicenceReturnLogsService = require('./void-licence-return-logs.service.js')

/**
 * Process voiding and reissuing return logs for a given licence reference
 *
 * @param {string} licenceId - The UUID of the licence to create return logs for
 * @param {Date} [changeDate] - An optional change date to use when determining which return logs to void and reissue
 */
async function go(licenceId, changeDate = null) {
  if (!changeDate) {
    changeDate = new Date()
  }

  const returnCycles = await _fetchReturnCycles(changeDate)

  for (const returnCycle of returnCycles) {
    const { id: returnCycleId, summer } = returnCycle
    const returnRequirements = await FetchLicenceReturnRequirementsService.go(licenceId, changeDate, summer)

    const generatedReturnLogIds = []
    for (const returnRequirement of returnRequirements) {
      const returnLogId = await _createReturnLog(returnRequirement, returnCycle)
      generatedReturnLogIds.push(returnLogId)
    }

    await _voidReturnLogs(returnRequirements, returnCycleId, changeDate, generatedReturnLogIds)
  }
}

async function _createReturnLog(returnRequirement, returnCycle) {
  const returnLog = GenerateReturnLogService.go(returnRequirement, returnCycle)
  const timestamp = timestampForPostgres()

  await ReturnLogModel.query()
    .insert({ ...returnLog, createdAt: timestamp, updatedAt: timestamp })
    .onConflict(['id'])
    .ignore()

  return returnLog.id
}

async function _fetchReturnCycles(changeDate) {
  return ReturnCycleModel.query()
    .select(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
    .where('endDate', '>=', changeDate)
    .orderBy('endDate', 'desc')
}

async function _voidReturnLogs(returnRequirements, returnCycleId, changeDate, generatedReturnLogIds) {
  if (returnRequirements.length === 0) {
    return
  }

  const licenceRef = returnRequirements[0].returnVersion.licence.licenceRef

  await VoidLicenceReturnLogsService.go(generatedReturnLogIds, licenceRef, returnCycleId, changeDate)
}

module.exports = {
  go
}
