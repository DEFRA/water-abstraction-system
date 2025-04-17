'use strict'

/**
 * Given a return cycle type, it checks if the cycle exists and if not creates it then returns the return cycle
 * @module CheckReturnCycleService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
} = require('../../lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../models/return-cycle.model.js')

/**
 * Given a return cycle type, it checks if the cycle exists and if not creates it then returns the return cycle
 *
 * @param {boolean} summer - If it's a summer or all year cycle
 * @param {Date} [changeDate] - A change date to use when determining which return cycle to use
 *
 * @returns {Promise<module:ReturnCycleModel>} the created return cycle
 */
async function go(summer, changeDate = new Date()) {
  const startDate = determineCycleStartDate(summer, changeDate)
  const endDate = determineCycleEndDate(summer, changeDate)

  const returnCycle = await _fetchReturnCycle(startDate, endDate, summer)

  if (!returnCycle) {
    const data = _generateData(summer, changeDate)

    return ReturnCycleModel.query().insert(data).returning(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
  }

  return returnCycle
}

async function _fetchReturnCycle(startDate, endDate, summer) {
  return ReturnCycleModel.query()
    .select(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
    .where('startDate', '>=', startDate)
    .where('endDate', '<=', endDate)
    .where('summer', summer)
    .first()
}

function _generateData(summer, changeDate) {
  const timestamp = timestampForPostgres()

  return {
    createdAt: timestamp,
    dueDate: determineCycleDueDate(summer, changeDate),
    endDate: determineCycleEndDate(summer, changeDate),
    summer,
    submittedInWrls: true,
    startDate: determineCycleStartDate(summer, changeDate),
    updatedAt: timestamp
  }
}

module.exports = {
  go
}
