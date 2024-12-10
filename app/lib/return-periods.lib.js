'use strict'

/**
 * Helper methods to deal with return period dates
 * @module ReturnPeriodDatesLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')
const { determineCycleStartDate, determineCycleEndDate, determineCycleDueDate } = require('./return-cycle-dates.lib')

/**
 * Determine returns periods
 *
 * Return periods are summer, allYear (winter) and quarters (Quarters are form April to April)
 *
 * Based on the current date or one provided this function will calculate the upcoming periods due dates.
 *
 *
 * @param {Date} determinationDate
 *
 * @returns {object} - The return periods calculated for the next one
 */
function determineReturnsPeriods(determinationDate = new Date()) {
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
      startDate: _startDateQuarterFour(determinationDate, returnCycleDates.quarterFour),
      endDate: _endDateQuarterFour(determinationDate, returnCycleDates.quarterFour),
      dueDate: _dueQuarterFour(determinationDate, returnCycleDates.quarterFour)
    }
  }
}

function _startDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodStartDay = cycle.startDate.day
  const periodStartMonth = cycle.startDate.month + 1
  const periodStartYear = _isDue(determinationDate, cycle) ? year + 1 : year

  return new Date(`${periodStartYear}-${periodStartMonth}-${periodStartDay}`)
}

function _endDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodEndDay = cycle.endDate.day
  const periodEndMonth = cycle.endDate.month + 1
  const periodEndYear = _isDue(determinationDate, cycle) ? year + 1 : year

  return new Date(`${periodEndYear}-${periodEndMonth}-${periodEndDay}`)
}

function _dueDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodDueDay = cycle.dueDate.day
  const periodDueMonth = cycle.dueDate.month + 1
  const periodDueYear = _isDue(determinationDate, cycle) ? year + 1 : year

  return new Date(`${periodDueYear}-${periodDueMonth}-${periodDueDay}`)
}

function _isDue(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodDueDay = cycle.dueDate.day
  const periodDueMonth = cycle.dueDate.month + 1

  const dueDate = new Date(`${year}-${periodDueMonth}-${periodDueDay}`)

  return dueDate.getTime() < determinationDate.getTime()
}

function _startDateQuarterFour(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const nextYear = year + 1

  const periodStartDay = cycle.startDate.day
  const periodStartMonth = cycle.startDate.month + 1
  let periodStartYear

  if (determinationDate.getTime() <= new Date(`${year}-12-31`)) {
    periodStartYear = year
  } else {
    periodStartYear = nextYear
  }

  return new Date(`${periodStartYear}-${periodStartMonth}-${periodStartDay}`)
}

function _endDateQuarterFour(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const nextYear = year + 1

  const periodStartDay = cycle.endDate.day
  const periodStartMonth = cycle.endDate.month + 1
  let periodStartYear

  if (determinationDate.getTime() <= new Date(`${year}-12-31`)) {
    periodStartYear = year
  } else {
    periodStartYear = nextYear
  }

  return new Date(`${periodStartYear}-${periodStartMonth}-${periodStartDay}`)
}

/**
 * Quarter Four spans a new year.
 *
 * It has to accommodate for the due date being in the next year
 *
 * If the determination date is in the next year. Then the due date will be in the following year for that
 *
 * So if the date is 2024-01-01 the Due date will be in 2025 and the Start and End will be in 2024
 *
 * @param {Date} determinationDate
 * @param {object} cycle
 *
 * @returns {Date} - The due date for quarter four is always the following year
 */
function _dueQuarterFour(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const nextYear = year + 1

  const periodDueDay = cycle.dueDate.day
  const periodDueMonth = cycle.dueDate.month + 1

  return new Date(`${nextYear}-${periodDueMonth}-${periodDueDay}`)
}

module.exports = {
  determineReturnsPeriods
}
