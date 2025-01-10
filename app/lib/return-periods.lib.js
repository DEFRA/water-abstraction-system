'use strict'

/**
 * Helper methods to deal with return periods
 * @module ReturnPeriodLib
 */

const { returnPeriodDates } = require('./static-lookups.lib.js')

/**
 * Determine return periods for a given return cycle.
 *
 * This function calculates the upcoming return periods for the provided return cycle.
 *
 * The result includes the start date, end date, and due date for each period as well as the return cycle id.
 *
 * @param {object} returnCycle - The return cycle to be broken into periods.
 *
 * @returns {Array<object>} An object containing calculated dates for all return periods
 */
function determineReturnsPeriods(returnCycle) {
  return [
    {
      startDate: _startDate(returnCycle.startDate, returnPeriodDates.quarterOne),
      endDate: _endDate(returnCycle.startDate, returnPeriodDates.quarterOne),
      id: returnCycle.id,
      dueDate: _dueDate(returnCycle.startDate, returnPeriodDates.quarterOne)
    },
    {
      startDate: _startDate(returnCycle.startDate, returnPeriodDates.quarterTwo),
      endDate: _endDate(returnCycle.startDate, returnPeriodDates.quarterTwo),
      id: returnCycle.id,
      dueDate: _dueDate(returnCycle.startDate, returnPeriodDates.quarterTwo)
    },
    {
      startDate: _startDateQuarterThree(returnCycle.startDate, returnPeriodDates.quarterThree),
      endDate: _endDateQuarterThree(returnCycle.startDate, returnPeriodDates.quarterThree),
      id: returnCycle.id,
      dueDate: _dueQuarterThree(returnCycle.startDate, returnPeriodDates.quarterThree)
    },
    {
      startDate: _startDate(returnCycle.endDate, returnPeriodDates.quarterFour),
      endDate: _endDate(returnCycle.endDate, returnPeriodDates.quarterFour),
      id: returnCycle.id,
      dueDate: _dueDate(returnCycle.endDate, returnPeriodDates.quarterFour)
    }
  ]
}

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
function determineUpcomingReturnsPeriods(determinationDate = new Date()) {
  return {
    allYear: {
      startDate: _cycleStartDate(determinationDate, returnPeriodDates.allYear),
      endDate: _endDate(determinationDate, returnPeriodDates.allYear),
      dueDate: _dueDate(determinationDate, returnPeriodDates.allYear)
    },
    summer: {
      startDate: _cycleStartDate(determinationDate, returnPeriodDates.summer),
      endDate: _endDate(determinationDate, returnPeriodDates.summer),
      dueDate: _dueDate(determinationDate, returnPeriodDates.summer)
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
      startDate: _startDateQuarterThree(determinationDate, returnPeriodDates.quarterThree),
      endDate: _endDateQuarterThree(determinationDate, returnPeriodDates.quarterThree),
      dueDate: _dueQuarterThree(determinationDate, returnPeriodDates.quarterThree)
    },
    quarterFour: {
      startDate: _startDate(determinationDate, returnPeriodDates.quarterFour),
      endDate: _endDate(determinationDate, returnPeriodDates.quarterFour),
      dueDate: _dueDate(determinationDate, returnPeriodDates.quarterFour)
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
 * Calculates the start date for Quarter Three based on the determination date.
 *
 * The start date is determined using the period's start day and month. The year for the start date
 * is always set to the year of the provided determination date, regardless of its specific value.
 *
 * @param {Date} determinationDate - The base date used to calculate the start date.
 * @param {object} period - The period object containing the start date information.
 *
 * @returns {Date} A `Date` object representing the start date of Quarter Three.
 * @private
 */
function _startDateQuarterThree(determinationDate, period) {
  const periodStartDay = period.startDate.day
  const periodStartMonth = period.startDate.month + 1

  const year = _newYearElapsedQuarterThree(determinationDate, period)

  return new Date(`${year}-${periodStartMonth}-${periodStartDay}`)
}

/**
 * Calculates the end date for Quarter Three based on the determination date.
 *
 * The end date is determined using the period's end day and month. If the determination date
 * falls on or before December 31 of the current year, the end year is set to the current year.
 * Otherwise, the end year is incremented to the next year, indicating that the quarter is
 * further in the future, with other periods falling before it.
 *
 * @param {Date} determinationDate - The base date used to calculate the end date.
 * @param {Object} period - The period object containing the end date information.
 *
 * @returns {Date} A `Date` object representing the end date of Quarter Three.
 * @private
 */
function _endDateQuarterThree(determinationDate, period) {
  const periodStartDay = period.endDate.day
  const periodStartMonth = period.endDate.month + 1

  const year = _newYearElapsedQuarterThree(determinationDate, period)

  return new Date(`${year}-${periodStartMonth}-${periodStartDay}`)
}

/**
 * Calculates the due date for Quarter Three, which spans into the next year.
 *
 * The due date is always set in the following year relative to the provided determination date.
 * For example, if the determination date is `2024-01-01`, the due date will be in `2025`,
 * while the start and end dates for the quarter would remain in `2024`.
 *
 * @param {Date} determinationDate - The base date used to calculate the due date.
 * @param {object} period - The period object containing the due date information.
 *
 * @returns {Date} A `Date` object representing the due date of Quarter Three, always in the following year.
 * @private
 */
function _dueQuarterThree(determinationDate, period) {
  const periodDueDay = period.dueDate.day
  const periodDueMonth = period.dueDate.month + 1

  const year = _newYearElapsedQuarterThreeDueDate(determinationDate, period)

  return new Date(`${year}-${periodDueMonth}-${periodDueDay}`)
}

/**
 * Determines whether the new year has elapsed for Quarter Three based on the determination date.
 *
 * This function calculates the year associated with Quarter Three by comparing the determination
 * date with the due date specified in the period. If the determination date is earlier than or equal
 * to the due date for Quarter Three in the current year, the previous year is returned (as the quarter is still Due).
 * Otherwise, the current year is returned.
 *
 * @param {Date} determinationDate - The base date used to determine the year for Quarter Three.
 * @param {object} period - The period object containing the due date information.
 *
 * @returns {number} The year associated with Quarter Three: the previous year if the determination date
 *                   is before or on the due date, otherwise the current year.
 * @private
 */
function _newYearElapsedQuarterThree(determinationDate, period) {
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
 * Determines the year associated with Quarter Three's due date based on the determination date.
 *
 * This function calculates the year for Quarter Three's due date by comparing the determination date
 * with the due date specified in the period. If the determination date is earlier than or equal to
 * the due date in the current year, the current year is returned. Otherwise, the next year is returned
 * (as the quarter is non longer due in the current year).
 *
 * @param {Date} determinationDate - The base date used to determine the year for Quarter Three's due date.
 * @param {object} period - The period object containing the due date information.
 *
 * @returns {number} The year associated with Quarter Three's due date: the current year if the determination
 *                   date is before or on the due date, otherwise the next year.
 * @private
 */
function _newYearElapsedQuarterThreeDueDate(determinationDate, period) {
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

/**
 * Determines the upcoming return periods based on a given determination date. It calculates the return periods,
 * maps them, sorts them by due date, and returns the current return period.
 *
 * @param {Date} [determinationDate=new Date()] - The date to determine the upcoming return periods from.
 * Defaults to the current date if not provided.
 *
 * @returns {object[]} - An array of return periods
 */
function determineUpcomingReturnPeriods(determinationDate = new Date()) {
  const returnPeriods = determineUpcomingReturnsPeriods(determinationDate)
  const mappedReturnPeriods = _mapReturnsPeriods(returnPeriods)
  return _sortByDueDate(mappedReturnPeriods)
}

/**
 * Maps the returnPeriods object to an array of objects with the key added as the name field.
 *
 * This name field can be used to extract the return period.
 *
 * @param {object} returnPeriods - The object containing return period information, where each key represents a period name and its value contains date properties.
 * @returns {Array<object>} An array of objects, each containing the `name` of the return period and its associated `dueDate`, `endDate`, and `startDate`.
 *
 * @example
 * Input: {
 *   quarterOne: { dueDate: '2024-01-31', endDate: '2024-03-31', startDate: '2024-01-01' },
 *   quarterTwo: { dueDate: '2024-04-30', endDate: '2024-06-30', startDate: '2024-04-01' }
 * }
 *
 * Output: [
 *    { name: 'quarterOne', dueDate: '2024-01-31', endDate: '2024-03-31', startDate: '2024-01-01' },
 *    { name: 'quarterTwo', dueDate: '2024-04-30', endDate: '2024-06-30', startDate: '2024-04-01' }
 *  ]
 */
function _mapReturnsPeriods(returnPeriods) {
  return Object.entries(returnPeriods).map(([key, value]) => {
    return { name: key, ...value }
  })
}

/**
 * Sorts an array of objects by their `dueDate` and, if they are equal, by their `startDate` (month and day only).
 *
 * @param {Array<object>} toSort - The array of objects to be sorted.
 *
 * @returns {Array<object>} The sorted array, first by `dueDate`, and then by the month and day of `startDate` in case of ties.
 */
function _sortByDueDate(toSort) {
  return toSort.sort(function (a, b) {
    if (a.dueDate.getTime() === b.dueDate.getTime()) {
      const aMonthDay = a.startDate.getMonth() * 100 + a.startDate.getDate()
      const bMonthDay = b.startDate.getMonth() * 100 + b.startDate.getDate()

      return aMonthDay - bMonthDay
    }
    return a.dueDate.getTime() - b.dueDate.getTime()
  })
}

/**
 * Calculates the start date for a given period (return cycle) based on the determination date.
 *
 * The start date is determined using the period's start day and month. If the determination date
 * indicates that the period is due, the year is the current year; otherwise, it is the previous year.
 *
 * @param {Date} determinationDate - The base date used to calculate the period's start date.
 * @param {object} period - An object containing the start date information for the period.
 *
 * @returns {Date} A `Date` object representing the calculated start date of the period.
 * @private
 */
function _cycleStartDate(determinationDate, period) {
  const currentYear = determinationDate.getFullYear()

  const startDay = period.startDate.day
  const startMonth = period.startDate.month + 1
  const startYear = _isDue(determinationDate, period) ? currentYear : currentYear - 1

  return new Date(`${startYear}-${startMonth}-${startDay}`)
}

module.exports = {
  determineReturnsPeriods,
  determineUpcomingReturnsPeriods,
  determineUpcomingReturnPeriods
}
