/**
 * Generates and persists return logs for the given return requirement and cycle
 * @module CreateReturnLogsService
 */

import GenerateReturnLogsService from 'water-abstraction-engine/services/return-logs/generate-return-logs.service.js'
import { db } from 'water-abstraction-engine/db/db.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

import featureFlagsConfig from '../../config/feature-flags.config.js'

/**
 * Generates and persists return logs for the given return requirement and cycle
 *
 * @param {module:ReturnRequirementModel} returnRequirement - the return requirement to generate return logs for
 * @param {module:ReturnCycleModel} returnCycle - the return cycle to generate return logs against
 * @param {Date} licenceEndDate - the licence end date if there is one
 * @param {object} [trx=null] - Optional transaction object
 *
 * @returns {Promise<string[]>} an array of the generated return log ids
 */
export default async function createReturnLogsService(returnRequirement, returnCycle, licenceEndDate, trx = null) {
  const returnLogs = GenerateReturnLogsService(
    returnRequirement,
    returnCycle,
    featureFlagsConfig.setOldReturnsDueDate,
    licenceEndDate
  )

  return _persistReturnLogs(returnLogs, trx)
}

async function _persistReturnLogs(returnLogs, trx) {
  const createdIds = []
  for (const returnLog of returnLogs) {
    const timestamp = timestampForPostgres()

    const query = db('returnLogs').withSchema('public')

    if (trx) {
      query.transacting(trx)
    }

    await query
      .insert({ ...returnLog, createdAt: timestamp, updatedAt: timestamp })
      .onConflict('returnId')
      .ignore()

    createdIds.push(returnLog.returnId)
  }

  return createdIds
}
