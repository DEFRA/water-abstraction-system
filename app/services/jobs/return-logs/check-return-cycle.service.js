'use strict'

/**
 * Check if the current summer or all year return cycle exists, and if not create it, then return the result
 * @module CheckReturnCycleService
 */

const { timestampForPostgres } = require('../../../lib/general.lib.js')
const {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
} = require('../../../lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../../models/return-cycle.model.js')

const featureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Check if the current summer or all year return cycle exists, and if not create it, then return the result
 *
 * Each year when the job runs the first thing it needs to do is check if the return cycle for that year has been
 * created.
 *
 * This service does the checking, and if no matching return cycle is found it creates it. Either the matching or new
 * return cycle is returned to `ProcessReturnLogsService`.
 *
 * If everything is running fine, we would expect this service to find no match and so create the new record. But just
 * in case there is an issue, and we need to run the job multiple times, we have it first check rather than assume it
 * is always creating the return cycle.
 *
 * @param {boolean} summer - true if checking for the current summer return cycle else false for all year
 *
 * @returns {Promise<module:ReturnCycleModel>} either the matching or newly created return cycle
 */
async function go(summer) {
  const currentDate = new Date()
  const startDate = determineCycleStartDate(summer, currentDate)
  const endDate = determineCycleEndDate(summer, currentDate)

  const matchingReturnCycle = await _matchingReturnCycle(startDate, endDate, summer)

  if (matchingReturnCycle) {
    return matchingReturnCycle
  }

  return _createReturnCycle(startDate, endDate, summer)
}

async function _createReturnCycle(startDate, endDate, summer) {
  const timestamp = timestampForPostgres()

  return ReturnCycleModel.query()
    .insert({
      createdAt: timestamp,
      dueDate: _dueDate(summer, endDate),
      endDate,
      startDate,
      submittedInWrls: true,
      summer,
      updatedAt: timestamp
    })
    .returning(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
}

function _dueDate(summer, endDate) {
  if (featureFlagsConfig.enableNullDueDate) {
    return null
  }

  return determineCycleDueDate(summer, endDate)
}

async function _matchingReturnCycle(startDate, endDate, summer) {
  return ReturnCycleModel.query()
    .select(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
    .where('startDate', '>=', startDate)
    .where('endDate', '<=', endDate)
    .where('summer', summer)
    .limit(1)
    .first()
}

module.exports = {
  go
}
