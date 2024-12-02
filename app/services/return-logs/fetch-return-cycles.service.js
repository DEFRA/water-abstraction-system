'use strict'

/**
 * Fetches the return cycles from the provided date forward
 * @module FetchReturnCyclesService
 */

const ReturnCycleModel = require('../../models/return-cycle.model.js')

const { cycleStartDateByDate } = require('../../lib/return-cycle-dates.lib.js')

/**
 * Given a date return all the return cycles from that date forward.
 *
 * @param {Date} date - this date could be an end date or todays date
 *
 * @returns {Promise<Array>} an array of return cycle details
 */
async function go(date) {
  const earliestSummerCycleStartDate = cycleStartDateByDate(date, true)
  const earliestAllYearCycleStartDate = cycleStartDateByDate(date, false)

  const summerReturnCycles = await _fetchReturnCycles(earliestSummerCycleStartDate, true)
  const allYearReturnCycles = await _fetchReturnCycles(earliestAllYearCycleStartDate, false)

  return [...summerReturnCycles, ...allYearReturnCycles]
}

async function _fetchReturnCycles(startDate, summer) {
  return await ReturnCycleModel.query()
    .select(['id', 'startDate', 'dueDate', 'endDate', 'summer'])
    .where('summer', summer)
    .where('startDate', '>=', startDate)
}

module.exports = {
  go
}