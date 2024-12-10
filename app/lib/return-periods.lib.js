'use strict'

/**
 * Helper methods to deal with return periods
 * @module ReturnPeriodLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')
const { determineCycleStartDate, determineCycleEndDate, determineCycleDueDate } = require('./return-cycle-dates.lib')

/**
 * Determine return periods.
 *
 * This function calculates the upcoming return periods based on the given date or the current date.
 * The return periods include summer, allYear (winter), and quarterly cycles. The dates for these periods
 * are defined in the static lookup library.
 *
 * The result includes the start date, end date, and due date for each period.
 *
 * @param {Date} determinationDate - The date to base the calculation on. Defaults to the current date.
 *
 * @returns {object} An object containing calculated dates for all return periods
 */
function determineReturnsPeriods(determinationDate = new Date()) {
  return {
    allYear: {
      startDate: determineCycleStartDate(false, determinationDate),
      endDate: determineCycleEndDate(false, determinationDate),
      dueDate: determineCycleDueDate(false, determinationDate)
    },
    summer: {
      startDate: determineCycleStartDate(true, determinationDate),
      endDate: determineCycleEndDate(true, determinationDate),
      dueDate: determineCycleDueDate(true, determinationDate)
    },
    quarterOne: {
      startDate: _startDate(determinationDate, returnCycleDates.quarterOne),
      endDate: _endDate(determinationDate, returnCycleDates.quarterOne),
      dueDate: _dueDate(determinationDate, returnCycleDates.quarterOne)
    },
    quarterTwo: {
      startDate: _startDate(determinationDate, returnCycleDates.quarterTwo),
      endDate: _endDate(determinationDate, returnCycleDates.quarterTwo),
      dueDate: _dueDate(determinationDate, returnCycleDates.quarterTwo)
    },
    quarterThree: {
      startDate: _startDate(determinationDate, returnCycleDates.quarterThree),
      endDate: _endDate(determinationDate, returnCycleDates.quarterThree),
      dueDate: _dueDate(determinationDate, returnCycleDates.quarterThree)
    },
    quarterFour: {
      startDate: _startDateQuarterFour(determinationDate, returnCycleDates.quarterFour),
      endDate: _endDateQuarterFour(determinationDate, returnCycleDates.quarterFour),
      dueDate: _dueQuarterFour(determinationDate, returnCycleDates.quarterFour)
    }
  }
}

/**
 * Calculate the start date for a given period based on the determination date.
 *
 * The start date is determined using the period's start day and month. If the determination date indicates
 * that the period is due, the start year is incremented by one; otherwise, it remains the current year.
 *
 * @param {Date} determinationDate - The base date used to calculate the start date.
 * @param {object} cycle - The cycle object containing the start date information (`day` and `month`).
 *
 * @returns {Date} - A `Date` object representing the start date of the period.
 * @private
 */
function _startDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodStartDay = cycle.startDate.day
  const periodStartMonth = cycle.startDate.month + 1
  const periodStartYear = _isDue(determinationDate, cycle) ? year + 1 : year

  return new Date(`${periodStartYear}-${periodStartMonth}-${periodStartDay}`)
}

/**
 * Calculate the end date for a given period based on the determination date.
 *
 * The end date is determined using the period's end day and month. If the determination date indicates
 * that the period is due, the end year is incremented by one; otherwise, it remains the current year.
 *
 * @param {Date} determinationDate - The base date used to calculate the end date.
 * @param {object} cycle - The cycle object containing the end date information (`day` and `month`).
 *
 * @returns {Date} - A `Date` object representing the end date of the period.
 * @private
 */
function _endDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodEndDay = cycle.endDate.day
  const periodEndMonth = cycle.endDate.month + 1
  const periodEndYear = _isDue(determinationDate, cycle) ? year + 1 : year

  return new Date(`${periodEndYear}-${periodEndMonth}-${periodEndDay}`)
}

/**
 * Calculate the due date for a given period based on the determination date.
 *
 * The due date is determined using the period's due day and month. If the determination date indicates
 * that the period is due, the due year is incremented by one; otherwise, it remains the current year.
 *
 * @param {Date} determinationDate - The base date used to calculate the due date.
 * @param {object} cycle - The cycle object containing the due date information (`day` and `month`).
 *
 * @returns {Date} - A `Date` object representing the due date of the period.
 * @private
 */
function _dueDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodDueDay = cycle.dueDate.day
  const periodDueMonth = cycle.dueDate.month + 1
  const periodDueYear = _isDue(determinationDate, cycle) ? year + 1 : year

  return new Date(`${periodDueYear}-${periodDueMonth}-${periodDueDay}`)
}

/**
 * Determine if the return period is due based on the determination date.
 *
 * The function compares the cycle's due date to the determination date. If the due date
 * is earlier than the determination date, the return period is considered due.
 *
 * @param {Date} determinationDate - The base date used for comparison.
 * @param {object} cycle - The cycle object containing the due date information (`day` and `month`).
 *
 * @returns `true` if the return period is due; otherwise, `false`.
 * @private
 */
function _isDue(determinationDate, cycle) {
  const year = determinationDate.getFullYear()

  const periodDueDay = cycle.dueDate.day
  const periodDueMonth = cycle.dueDate.month + 1

  const dueDate = new Date(`${year}-${periodDueMonth}-${periodDueDay}`)

  return dueDate.getTime() < determinationDate.getTime()
}

/**
 * Calculate the start date for Quarter Four based on the determination date.
 *
 * The start date is determined using the cycle's start day and month. If the determination date
 * is on or before December 31 of the current year, the start year is set to the current year.
 * Otherwise, the start year is incremented to the next year.
 * (This indicates the period is further in the future with other periods falling before it)
 *
 * @param {Date} determinationDate - The base date used to calculate the start date.
 * @param {object} cycle - The cycle object containing the start date information.
 *
 * @returns {Date} A `Date` object representing the start date of Quarter Four.
 * @private
 */
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

/**
 * Calculate the end date for Quarter Four based on the determination date.
 *
 * The end date is determined using the cycle's end day and month. If the determination date
 * is on or before December 31 of the current year, the end year is set to the current year.
 * Otherwise, the end year is incremented to the next year.
 * (This indicates the period is further in the future with other periods falling before it)
 *
 * @param {Date} determinationDate - The base date used to calculate the end date.
 * @param {Object} cycle - The cycle object containing the end date information.
 *
 * @returns {Date} A `Date` object representing the end date of Quarter Four.
 * @private
 */
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
 * Calculate the due date for Quarter Four, which spans into the next year.
 *
 * If the determination date is within the current year, the due date will be in the following year.
 * For example, if the determination date is `2024-01-01`, the due date will be in `2025`, while the
 * start and end dates will be in `2024`.
 *
 * @param {Date} determinationDate - The base date used to calculate the due date.
 * @param {object} cycle - The cycle object containing the due date information.
 *
 * @returns {Date} A `Date` object representing the due date of Quarter Four, always in the following year.
 * @private
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
