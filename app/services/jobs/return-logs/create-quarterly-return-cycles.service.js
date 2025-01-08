'use strict'

/**
 * Given a return cycle, generate each quarterly return period
 * @module CreateQuarterlyReturnCycleService
 */

const { quarterlyReturnPeriods } = require('../../../lib/static-lookups.lib.js')

/**
 * Given a return cycle, generate each quarterly return period
 *
 * @param {object} returnCycle - the return cycle to break into quarterly period
 *
 * @returns {Array<object>} the created quarterly return periods
 */
function go(returnCycle) {
  if (!returnCycle) {
    return []
  }

  const year = returnCycle.startDate.getFullYear()

  return [
    {
      dueDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterOne.dueDate.month + 1}-${quarterlyReturnPeriods.quarterOne.dueDate.day}`
      ),
      endDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterOne.endDate.month + 1}-${quarterlyReturnPeriods.quarterOne.endDate.day}`
      ),
      id: returnCycle.id,
      startDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterOne.startDate.month + 1}-${quarterlyReturnPeriods.quarterOne.startDate.day}`
      )
    },
    {
      dueDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterTwo.dueDate.month + 1}-${quarterlyReturnPeriods.quarterTwo.dueDate.day}`
      ),
      endDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterTwo.endDate.month + 1}-${quarterlyReturnPeriods.quarterTwo.endDate.day}`
      ),
      id: returnCycle.id,
      startDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterTwo.startDate.month + 1}-${quarterlyReturnPeriods.quarterTwo.startDate.day}`
      )
    },
    {
      dueDate: new Date(
        `${year + 1}-${quarterlyReturnPeriods.quarterThree.dueDate.month + 1}-${quarterlyReturnPeriods.quarterThree.dueDate.day}`
      ),
      endDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterThree.endDate.month + 1}-${quarterlyReturnPeriods.quarterThree.endDate.day}`
      ),
      id: returnCycle.id,
      startDate: new Date(
        `${year}-${quarterlyReturnPeriods.quarterThree.startDate.month + 1}-${quarterlyReturnPeriods.quarterThree.startDate.day}`
      )
    },
    {
      dueDate: new Date(
        `${year + 1}-${quarterlyReturnPeriods.quarterFour.dueDate.month + 1}-${quarterlyReturnPeriods.quarterFour.dueDate.day}`
      ),
      endDate: new Date(
        `${year + 1}-${quarterlyReturnPeriods.quarterFour.endDate.month + 1}-${quarterlyReturnPeriods.quarterFour.endDate.day}`
      ),
      id: returnCycle.id,
      startDate: new Date(
        `${year + 1}-${quarterlyReturnPeriods.quarterFour.startDate.month + 1}-${quarterlyReturnPeriods.quarterFour.startDate.day}`
      )
    }
  ]
}

module.exports = {
  go
}
