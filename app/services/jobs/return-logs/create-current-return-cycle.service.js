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
 * Given a return cycle type, it generates the cycle data based on the current date and creates it
 *
 * @param {boolean} summer - true if creating the current summer return cycle, else false
 *
 * @returns {Promise<module:ReturnCycleModel>} the created return cycle
 */
async function go(summer) {
  const data = _generateData(summer)

  return ReturnCycleModel.query().insert(data).returning('*')
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
