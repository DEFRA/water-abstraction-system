'use strict'

/**
 * Helper methods to deal with return period dates
 * @module ReturnPeriodDatesLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')
const { determineCycleStartDate, determineCycleEndDate, determineCycleDueDate } = require('./return-cycle-dates.lib')

/**
 *
 * @param {Date} determinationDate
 */
function determineReturnsPeriods(determinationDate = new Date()) {
  const year = determinationDate.getFullYear()

  return {
    allYear: {
      name: 'allYear',
      startDate: determineCycleStartDate(false, determinationDate),
      endDate: determineCycleEndDate(false, determinationDate),
      dueDate: determineCycleDueDate(false, determinationDate)
    },
    summer: {
      name: 'summer',
      startDate: determineCycleStartDate(true, determinationDate),
      endDate: determineCycleEndDate(true, determinationDate),
      dueDate: determineCycleDueDate(true, determinationDate)
    },
    quarterOne: {
      name: 'quarterOne',
      startDate: _startDate(determinationDate, returnCycleDates.quarterOne),
      endDate: _endDate(determinationDate, returnCycleDates.quarterOne),
      dueDate: _dueDate(determinationDate, returnCycleDates.quarterOne)
    },
    quarterTwo: {
      name: 'quarterTwo',
      startDate: _startDate(determinationDate, returnCycleDates.quarterTwo),
      endDate: _endDate(determinationDate, returnCycleDates.quarterTwo),
      dueDate: _dueDate(determinationDate, returnCycleDates.quarterTwo)
    },
    quarterThree: {
      name: 'quarterThree',
      startDate: _startDate(determinationDate, returnCycleDates.quarterThree),
      endDate: _endDate(determinationDate, returnCycleDates.quarterThree),
      dueDate: _dueDate(determinationDate, returnCycleDates.quarterThree)
    },
    quarterFour: {
      name: 'quarterFour',
      startDate: _startDate(determinationDate, returnCycleDates.quarterFour),
      endDate: _endDate(determinationDate, returnCycleDates.quarterFour),
      dueDate: _dueDate(determinationDate, returnCycleDates.quarterFour)
    }
  }
}

function _startDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodStartDay = cycle.startDate.day
  const periodStartMonth = cycle.startDate.month + 1
  const periodStartYear = year

  return new Date(`${periodStartYear}-${periodStartMonth}-${periodStartDay}`)
}

function _endDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodEndDay = cycle.endDate.day
  const periodEndMonth = cycle.endDate.month + 1
  const periodEndYear = year

  return new Date(`${periodEndYear}-${periodEndMonth}-${periodEndDay}`)
}

function _dueDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodDueDay = cycle.dueDate.day
  const periodDueMonth = cycle.dueDate.month + 1
  const periodDueYear = year

  return new Date(`${periodDueYear}-${periodDueMonth}-${periodDueDay}`)
}

module.exports = {
  determineReturnsPeriods
}
