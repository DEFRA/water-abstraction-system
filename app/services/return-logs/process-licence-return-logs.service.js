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
const VoidReturnLogsService = require('./void-return-logs.service.js')

/**
 * Process voiding and reissuing return logs for a given licence reference
 *
 * @param {string} licenceReference - The licence to create return logs for
 * @param {Date} [endDate] - An optional end date to use when determining which return logs to void and reissue
 */
async function go(licenceReference, endDate = null) {
  if (endDate) {
    await VoidReturnLogsService.go(licenceReference, endDate)
  } else {
    endDate = new Date()
  }

  const returnCycles = await _fetchReturnCycles(endDate)

  for (const returnCycle of returnCycles) {
    const returnRequirements = await FetchReturnRequirementsService.go(returnCycle, licenceReference)

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

module.exports = {
  go
}
