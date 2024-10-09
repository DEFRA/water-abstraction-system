'use strict'

/**
 * Fetches the return cycle for the given date
 * @module FetchReturnCycleService
 */

const ReturnCycleModel = require('../../../models/return-cycle.model.js')

const { returnCycleDates } = require('../../../lib/static-lookups.lib.js')
const { CycleStartDateByDate } = require('../../../lib/dates.lib.js')

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
  const cycleStartDate = CycleStartDateByDate(_date, summer)
  const cycleEndDate = _cycleEndDateByDate(_date, summer)
  const data = await _fetchReturnCycle(cycleStartDate, cycleEndDate, summer)

  if (data) {
    return data.id
  }

  return undefined
}

function _cycleEndDateByDate (date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (summer) {
    if (month >= returnCycleDates.summer.endDate.month) {
      return `${year + 1}-10-31`
    }

    return `${year}-10-31`
  }

  if (month >= returnCycleDates.allYear.endDate.month) {
    return `${year + 1}-03-31`
  }

  return `${year}-03-31`
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
