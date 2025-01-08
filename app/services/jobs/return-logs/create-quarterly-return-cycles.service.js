'use strict'

/**
 * Given a return cycle, generate each quarterly return period
 * @module CreateQuarterlyReturnCycleService
 */

const { determineReturnsPeriods } = require('../../../lib/return-periods.lib.js')

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

  // To reuse as much code as possible we use two dates to determine the quarterly return periods
  // The first one uses the start date of the return cycle, and the second uses the end date
  // This enables us to get the correct year for quarter four while reusing exisitng code
  const quarterlyReturnPeriods = determineReturnsPeriods(returnCycle.startDate)
  const quarterFourReturnPeriod = determineReturnsPeriods(returnCycle.endDate)

  return [
    {
      dueDate: quarterlyReturnPeriods.quarterOne.dueDate,
      endDate: quarterlyReturnPeriods.quarterOne.endDate,
      id: returnCycle.id,
      startDate: quarterlyReturnPeriods.quarterOne.startDate
    },
    {
      dueDate: quarterlyReturnPeriods.quarterTwo.dueDate,
      endDate: quarterlyReturnPeriods.quarterTwo.endDate,
      id: returnCycle.id,
      startDate: quarterlyReturnPeriods.quarterTwo.startDate
    },
    {
      dueDate: quarterlyReturnPeriods.quarterThree.dueDate,
      endDate: quarterlyReturnPeriods.quarterThree.endDate,
      id: returnCycle.id,
      startDate: quarterlyReturnPeriods.quarterThree.startDate
    },
    {
      dueDate: quarterFourReturnPeriod.quarterFour.dueDate,
      endDate: quarterFourReturnPeriod.quarterFour.endDate,
      id: returnCycle.id,
      startDate: quarterFourReturnPeriod.quarterFour.startDate
    }
  ]
}

module.exports = {
  go
}
