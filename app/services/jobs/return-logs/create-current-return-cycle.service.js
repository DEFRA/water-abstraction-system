'use strict'

/**
 * Given a return cycle type, it generates the cycle data based on the current date and creates it
 * @module CreateCurrentReturnCycleService
 */

const { timestampForPostgres } = require('../../../lib/general.lib.js')
const {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
} = require('../../../lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../../models/return-cycle.model.js')

/**
 * Verify that the town most recent return cycles are the most current ones. If they're not create the missing cycles.
 *
 * @returns {Promise<module:ReturnCycleModel>} the created return cycle
 */
async function go() {
  const returnCycles = await _fetchMostRecentCycles()

  const summerStartDate = determineCycleStartDate(false)
  const winterStartDate = determineCycleStartDate(true)

  const hasCurrentSummerCycle = returnCycles.find((cycle) => {
    return cycle.startDate.getTime() === summerStartDate.getTime()
  })

  const hasCurrentWinterCycle = returnCycles.find((cycle) => {
    return cycle.startDate.getTime() === winterStartDate.getTime()
  })

  const data = []

  if (!hasCurrentSummerCycle) {
    data.push(_generateData(true))
  }

  if (!hasCurrentWinterCycle) {
    data.push(_generateData(false))
  }

  if (data.length > 0) {
    await ReturnCycleModel.query().insert(data)
  }
}

async function _fetchMostRecentCycles() {
  return ReturnCycleModel.query()
    .select(['dueDate', 'endDate', 'id', 'startDate', 'summer'])
    .orderBy('startDate', 'DESC')
    .limit(2)
}

function _generateData(summer) {
  const timestamp = timestampForPostgres()

  return {
    createdAt: timestamp,
    dueDate: determineCycleDueDate(summer),
    endDate: determineCycleEndDate(summer),
    summer,
    submittedInWrls: true,
    startDate: determineCycleStartDate(summer),
    updatedAt: timestamp
  }
}

module.exports = {
  go
}
