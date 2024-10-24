'use strict'

/**
 * Fetches the return cycle for the given date
 * @module FetchReturnCycleService
 */

const ReturnCycleModel = require('../../../models/return-cycle.model.js')

const { cycleEndDateByDate, cycleStartDateByDate } = require('../../../lib/return-cycle-dates.lib.js')

/**
 * Given a date this service returns the return cycle for that date.
 *
 * @param {string} date - the date to find the return cycle for - YYYY-MM-DD
 * @param {boolean} summer - which cycle to return - summer or winter and all year
 *
 * @returns {Promise<string>} the id of the return cycle
 */
async function go (date, summer) {
  const _date = new Date(date)
  const cycleStartDate = cycleStartDateByDate(_date, summer)
  const cycleEndDate = cycleEndDateByDate(_date, summer)
  const data = await _fetchReturnCycle(cycleStartDate, cycleEndDate, summer)

  if (data) {
    return data.id
  }

  return undefined
}

async function _fetchReturnCycle (startDate, endDate, summer) {
  return ReturnCycleModel.query()
    .select(['id'])
    .where('startDate', '>=', startDate)
    .where('endDate', '<=', endDate)
    .where('summer', summer)
    .limit(1)
    .first()
}

module.exports = {
  go
}
