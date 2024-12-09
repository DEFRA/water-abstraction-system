'use strict'

/**
 * Helper methods to deal with return periods
 * @module ReturnPeriodLib
 */

const { returnPeriodDates } = require('./static-lookups.lib.js')
const { determineCycleStartDate, determineCycleEndDate, determineCycleDueDate } = require('./return-cycle-dates.lib')

/**
 * Determine return periods.
 *
 * This function calculates the upcoming return periods based on the given date or the current date.
 * The return periods include summer, allYear (winter), and quarterly periods. The dates for these periods
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
      startDate: _startDate(determinationDate, returnPeriodDates.quarterOne),
      endDate: _endDate(determinationDate, returnPeriodDates.quarterOne),
      dueDate: _dueDate(determinationDate, returnPeriodDates.quarterOne)
    },
    quarterTwo: {
      startDate: _startDate(determinationDate, returnPeriodDates.quarterTwo),
      endDate: _endDate(determinationDate, returnPeriodDates.quarterTwo),
      dueDate: _dueDate(determinationDate, returnPeriodDates.quarterTwo)
    },
    quarterThree: {
      startDate: _startDate(determinationDate, returnPeriodDates.quarterThree),
      endDate: _endDate(determinationDate, returnPeriodDates.quarterThree),
      dueDate: _dueDate(determinationDate, returnPeriodDates.quarterThree)
    },
    quarterFour: {
      startDate: _startDateQuarterFour(determinationDate, returnPeriodDates.quarterFour),
      endDate: _endDateQuarterFour(determinationDate, returnPeriodDates.quarterFour),
      dueDate: _dueQuarterFour(determinationDate, returnPeriodDates.quarterFour)
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
 * @param {object} period - The period object containing the start date information (`day` and `month`).
 *
 * @returns {Date} - A `Date` object representing the start date of the period.
 * @private
 */
function _startDate(determinationDate, period) {
  const year = determinationDate.getFullYear()

  const periodStartDay = period.startDate.day
  const periodStartMonth = period.startDate.month + 1
  const periodStartYear = _isDue(determinationDate, period) ? year + 1 : year

  return new Date(`${periodStartYear}-${periodStartMonth}-${periodStartDay}`)
}

/**
 * Calculate the end date for a given period based on the determination date.
 *
 * The end date is determined using the period's end day and month. If the determination date indicates
 * that the period is due, the end year is incremented by one; otherwise, it remains the current year.
 *
 * @param {Date} determinationDate - The base date used to calculate the end date.
 * @param {object} period - The period object containing the end date information (`day` and `month`).
 *
 * @returns {Date} - A `Date` object representing the end date of the period.
 * @private
 */
function _endDate(determinationDate, period) {
  const year = determinationDate.getFullYear()

  const periodEndDay = period.endDate.day
  const periodEndMonth = period.endDate.month + 1
  const periodEndYear = _isDue(determinationDate, period) ? year + 1 : year

  return new Date(`${periodEndYear}-${periodEndMonth}-${periodEndDay}`)
}

/**
 * Calculate the due date for a given period based on the determination date.
 *
 * The due date is determined using the period's due day and month. If the determination date indicates
 * that the period is due, the due year is incremented by one; otherwise, it remains the current year.
 *
 * @param {Date} determinationDate - The base date used to calculate the due date.
 * @param {object} period - The period object containing the due date information (`day` and `month`).
 *
 * @returns {Date} - A `Date` object representing the due date of the period.
 * @private
 */
function _dueDate(determinationDate, period) {
  const year = determinationDate.getFullYear()

  const periodDueDay = period.dueDate.day
  const periodDueMonth = period.dueDate.month + 1
  const periodDueYear = _isDue(determinationDate, period) ? year + 1 : year

  return new Date(`${periodDueYear}-${periodDueMonth}-${periodDueDay}`)
}

/**
 * Determine if the return period is due based on the determination date.
 *
 * The function compares the period's due date to the determination date. If the due date
 * is earlier than the determination date, the return period is considered due.
 *
 * @param {Date} determinationDate - The base date used for comparison.
 * @param {object} period - The period object containing the due date information (`day` and `month`).
 *
 * @returns `true` if the return period is due; otherwise, `false`.
 * @private
 */
function _isDue(determinationDate, period) {
  const year = determinationDate.getFullYear()

  const periodDueDay = period.dueDate.day
  const periodDueMonth = period.dueDate.month + 1

  const dueDate = new Date(`${year}-${periodDueMonth}-${periodDueDay}`)

  return dueDate.getTime() < determinationDate.getTime()
}

/**
 * Calculates the start date for Quarter Four based on the determination date.
 *
 * The start date is determined using the period's start day and month. The year for the start date
 * is always set to the year of the provided determination date, regardless of its specific value.
 *
 *
 * @param {Date} determinationDate - The base date used to calculate the start date.
 * @param {object} period - The period object containing the start date information.
 *
 * @returns {Date} A `Date` object representing the start date of Quarter Four.
 * @private
 */
function _startDateQuarterFour(determinationDate, period) {
  const periodStartDay = period.startDate.day
  const periodStartMonth = period.startDate.month + 1

  const year = _newYearElapsedQuarterFour(determinationDate, period)

  return new Date(`${year}-${periodStartMonth}-${periodStartDay}`)
}

/**
 * Calculates the end date for Quarter Four based on the determination date.
 *
 * The end date is determined using the period's end day and month. If the determination date
 * falls on or before December 31 of the current year, the end year is set to the current year.
 * Otherwise, the end year is incremented to the next year, indicating that the quarter is
 * further in the future, with other periods falling before it.
 *
 * @param {Date} determinationDate - The base date used to calculate the end date.
 * @param {Object} period - The period object containing the end date information.
 *
 * @returns {Date} A `Date` object representing the end date of Quarter Four.
 * @private
 */
function _endDateQuarterFour(determinationDate, period) {
  const periodStartDay = period.endDate.day
  const periodStartMonth = period.endDate.month + 1

  const year = _newYearElapsedQuarterFour(determinationDate, period)

  return new Date(`${year}-${periodStartMonth}-${periodStartDay}`)
}

/**
 * Calculates the due date for Quarter Four, which spans into the next year.
 *
 * The due date is always set in the following year relative to the provided determination date.
 * For example, if the determination date is `2024-01-01`, the due date will be in `2025`,
 * while the start and end dates for the quarter would remain in `2024`.
 *
 * @param {Date} determinationDate - The base date used to calculate the due date.
 * @param {object} period - The period object containing the due date information.
 *
 * @returns {Date} A `Date` object representing the due date of Quarter Four, always in the following year.
 * @private
 */
function _dueQuarterFour(determinationDate, period) {
  const periodDueDay = period.dueDate.day
  const periodDueMonth = period.dueDate.month + 1

  const year = _newYearElapsedQuarterFourDueDate(determinationDate, period)

  return new Date(`${year}-${periodDueMonth}-${periodDueDay}`)
}

/**
 * Determines whether the new year has elapsed for Quarter Four based on the determination date.
 *
 * This function calculates the year associated with Quarter Four by comparing the determination
 * date with the due date specified in the period. If the determination date is earlier than or equal
 * to the due date for Quarter Four in the current year, the previous year is returned (as the quarter is still Due).
 * Otherwise, the current year is returned.
 *
 * @param {Date} determinationDate - The base date used to determine the year for Quarter Four.
 * @param {object} period - The period object containing the due date information.
 *
 * @returns {number} The year associated with Quarter Four: the previous year if the determination date
 *                   is before or on the due date, otherwise the current year.
 * @private
 */
function _newYearElapsedQuarterFour(determinationDate, period) {
  const year = determinationDate.getFullYear()
  const lastYear = year - 1

  const periodDueDay = period.dueDate.day
  const periodDueMonth = period.dueDate.month + 1

  if (determinationDate.getTime() <= new Date(`${year}-${periodDueMonth}-${periodDueDay}`).getTime()) {
    return lastYear
  } else {
    return year
  }
}

/**
 * Determines the year associated with Quarter Four's due date based on the determination date.
 *
 * This function calculates the year for Quarter Four's due date by comparing the determination date
 * with the due date specified in the period. If the determination date is earlier than or equal to
 * the due date in the current year, the current year is returned. Otherwise, the next year is returned
 * (as the quarter is non longer due in the current year).
 *
 * @param {Date} determinationDate - The base date used to determine the year for Quarter Four's due date.
 * @param {object} period - The period object containing the due date information.
 *
 * @returns {number} The year associated with Quarter Four's due date: the current year if the determination
 *                   date is before or on the due date, otherwise the next year.
 * @private
 */
function _newYearElapsedQuarterFourDueDate(determinationDate, period) {
  const year = determinationDate.getFullYear()
  const nextYear = year + 1

  const periodDueDay = period.dueDate.day
  const periodDueMonth = period.dueDate.month + 1

  if (determinationDate.getTime() <= new Date(`${year}-${periodDueMonth}-${periodDueDay}`).getTime()) {
    return year
  } else {
    return nextYear
  }
}

module.exports = {
  determineReturnsPeriods
}
