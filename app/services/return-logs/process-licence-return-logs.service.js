'use strict'

/**
 * Process voiding and reissuing return logs for a given licence reference
 * @module ProcessLicenceReturnLogsService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const FetchReturnRequirementsService = require('./fetch-return-requirements.service.js')
const GenerateReturnLogService = require('./generate-return-log.service.js')
const ReturnCycleModel = require('../../models/return-cycle.model.js')
const ReturnLogModel = require('../../models/return-log.model.js')

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

  await _voidReturnLogs(licenceId, changeDate)
  const returnCycles = await _fetchReturnCycles(changeDate)

  for (const returnCycle of returnCycles) {
    const returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licenceId)

    for (const returnRequirement of returnRequirements) {
      await _createReturnLog(returnRequirement, returnCycle)
    }
  }
}

async function _createReturnLog(returnRequirement, returnCycle) {
  const returnLog = GenerateReturnLogService.go(returnRequirement, returnCycle)
  const timestamp = timestampForPostgres()

  await ReturnLogModel.query().insert({ ...returnLog, createdAt: timestamp, updatedAt: timestamp })
}

async function _fetchReturnCycles(endDate) {
  return ReturnCycleModel.query()
    .select(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
    .where('endDate', '>=', endDate)
    .orderBy('endDate', 'desc')
}

async function _voidReturnLogs(licenceRef, changeDate) {
  await ReturnLogModel.query()
    .patch({ status: 'void' })
    .where('licenceRef', licenceRef)
    .where('endDate', '>=', changeDate)
}

module.exports = {
  go
}
