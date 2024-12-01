'use strict'

/**
 * Given a return cycle type, it generates
 * @module GenerateCurrentReturnCycleService
 */

const { timestampForPostgres } = require('../../../lib/general.lib.js')
const { cycleDueDateAsISO, cycleEndDateAsISO, cycleStartDateAsISO } = require('../../../lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../../models/return-cycle.model.js')

/**
 * Creates the new entry in the return_cycle table and returns its id.
 *
 * @param {boolean} summer - are we running summer cycle or all year
 *
 * @returns {Promise<module:ReturnCycleModel>} the return cycle details that has been created
 */
async function go(summer) {
  const data = _generateData(summer)

  return ReturnCycleModel.query().insert(data).returning('*')
}

function _generateData(summer) {
  const timestamp = timestampForPostgres()

  return {
    createdAt: timestamp,
    dueDate: cycleDueDateAsISO(summer),
    endDate: cycleEndDateAsISO(summer),
    summer,
    submittedInWrls: true,
    startDate: cycleStartDateAsISO(summer),
    updatedAt: timestamp
  }
}

module.exports = {
  go
}
