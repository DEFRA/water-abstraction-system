'use strict'

/**
 * Generates the current return cycle either summer or all year depending on the passed in boolean.
 * @module GenerateReturnCycleService
 */

const { cycleDueDateAsISO, cycleEndDateAsISO, cycleStartDateAsISO } = require('../../../lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../../models/return-cycle.model.js')

/**
 * Creates the new entry in the return_cycle table and returns its id.
 *
 * @param {boolean} summer - are we running summer cycle or all year
 *
 * @returns {Promise<string>} the UUID of the return cycle that has been created
 */
async function go(summer) {
  const data = _generateData(summer)
  const returnCycle = await _createReturnCycle(data)

  return returnCycle
}

function _createReturnCycle(returnCycle) {
  return ReturnCycleModel.query()
    .insert(returnCycle)
    .onConflict(['startDate', 'endDate', 'summer'])
    .merge(['dueDate', 'submittedInWrls', 'updatedAt'])
}

function _generateData(summer) {
  const dueDate = cycleDueDateAsISO(summer)
  const endDate = cycleEndDateAsISO(summer)
  const startDate = cycleStartDateAsISO(summer)

  return {
    createdAt: new Date(),
    dueDate,
    endDate,
    summer,
    submittedInWrls: true,
    startDate,
    updatedAt: new Date()
  }
}

module.exports = {
  go
}
