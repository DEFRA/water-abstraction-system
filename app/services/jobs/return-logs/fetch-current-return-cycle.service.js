'use strict'

/**
 * Given a return cycle type, it fetches the current matching return cycle
 * @module FetchReturnCycleService
 */

const { cycleEndDate, cycleStartDateByDate } = require('../../../lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../../models/return-cycle.model.js')

/**
 * Given a return cycle type, it fetches the current matching return cycle
 *
 * @param {boolean} summer - true if looking for the current summer return cycle, else false
 *
 * @returns {Promise<module:ReturnCycleModel>} the matching return cycle, else `undefined`
 */
async function go(summer) {
  const today = new Date()

  const startDate = cycleStartDateByDate(today, summer)
  const endDate = cycleEndDate(summer)

  return _fetch(startDate, endDate, summer)
}

async function _fetch(startDate, endDate, summer) {
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
