'use strict'

/**
 * Helper methods to deal with return cycle dates
 * @module ReturnCycleDatesLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')

/**
 * Determine the due date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year
 * @param {Date} [determinationDate] - the date by which to determine the cycle's 'due date' (defaults to current date)
 *
 * @returns {Date} the due date of the next cycle
 */
function determineCycleDueDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _dueDate(determinationDate, returnCycleDates.summer)
  }

  return _dueDate(determinationDate, returnCycleDates.allYear)
}

/**
 * Determine the end date of next provided cycle, either summer and winter or all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year
 * @param {Date} [determinationDate] - the date by which to determine the cycle's 'end date' (defaults to current date)
 *
 * @returns {Date} the end date of the next cycle
 */
function determineCycleEndDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _endDate(determinationDate, returnCycleDates.summer)
  }

  return _endDate(determinationDate, returnCycleDates.allYear)
}

/**
 * Determine the start date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year
 * @param {Date} [determinationDate] - the date by which to determine the cycle's 'start date' (defaults to current
 * date)
 *
 * @returns {Date} the start date of the next cycle.
 */
function determineCycleStartDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _startDate(determinationDate, returnCycleDates.summer)
  }

  return _startDate(determinationDate, returnCycleDates.allYear)
}

function _dueDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const month = determinationDate.getMonth()

  const cycleDueDay = cycle.dueDate.day
  const cycleDueMonth = cycle.dueDate.month + 1
  const cycleDueYear = month > cycle.endDate.month ? year + 1 : year

  return new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)
}

function _endDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const month = determinationDate.getMonth()

  const cycleEndDay = cycle.endDate.day
  const cycleEndMonth = cycle.endDate.month + 1
  const cycleEndYear = month > cycle.endDate.month ? year + 1 : year

  return new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)
}

function _startDate(determinationDate, cycle) {
  const year = determinationDate.getFullYear()
  const month = determinationDate.getMonth()

  const cycleStartDay = cycle.startDate.day
  const cycleStartMonth = cycle.startDate.month + 1
  const cycleStartYear = month < cycle.startDate.month ? year - 1 : year

  return new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)
}

/**
 * The return periods
 *
 * All year (Winter)
 * Name       | Start Date  | End Date  | Due Date  |
 * Full year    1/04/25       31/03/26    28/04/26
 * Q1           1/04/25       30/06/25    28/07/25
 * Q2           1/07/25       31/09/25    28/10/25
 * Q3           1/10/25       31/12/25    28/01/26
 * Q4           1/01/26       31/03/26    28/04/26
 *
 * Summer (Annual)
 * Name       | Start Date  | End Date  | Due Date  |
 * Full year    1/11/26       31/10/27    28/11/27
 * Q1           1/11/26       31/01/26    28/02/26
 * Q2           1/02/27       30/04/27    28/05/27
 * Q3           1/05/27       31/07/27    28/08/27
 * Q4           1/08/27       31/10/27    28/11/27
 *
 * @param {Date} date - the date to calculate the return periods
 *
 * @returns {object} - return periods
 */
function periods(date) {
  const year = date.getFullYear()

  return {
    winterFullYear: {
      // Done
      name: 'winterFullYear', // this has a func to calculate
      startDate: new Date(`${year}-04-01`),
      endDate: new Date(`${year + 1}-03-31`), // year fandango - use
      dueDate: new Date(`${year + 1}-04-28`) // year fandango
    },
    winterQuarterOne: {
      // Done
      name: 'winterQuarterOne',
      startDate: new Date(`${year}-04-01`),
      endDate: new Date(`${year}-06-30`),
      dueDate: new Date(`${year}-07-28`)
    },
    winterQuarterTwo: {
      // Done - should appear twice ?
      name: 'winterQuarterTwo',
      startDate: new Date(`${year}-07-01`),
      endDate: new Date(`${year}-09-31`),
      dueDate: new Date(`${year}-10-28`)
    },
    winterQuarterThree: {
      // Done - appears twice (tested once)
      name: 'winterQuarterThree',
      startDate: new Date(`${year}-10-01`),
      endDate: new Date(`${year}-12-31`),
      dueDate: new Date(`${year + 1}-01-28`)
    },
    winterQuarterFour: {
      // Done (appears twice with year increases ? - like it's all next year - AC 5)
      name: 'winterQuarterFour',
      startDate: new Date(`${year + 1}-01-01`),
      endDate: new Date(`${year + 1}-03-31`),
      dueDate: new Date(`${year + 1}-04-28`)
    },
    summerFullYear: {
      // Done - appears twice (tested once)
      name: 'summerFullYear', // this has a func to calculate
      startDate: new Date(`${year}-11-01`),
      endDate: new Date(`${year}-10-31`), // year fandango
      dueDate: new Date(`${year}-11-28`) // year fandango
    },
    summerQuarterOne: {
      name: 'summerQuarterOne',
      // This might be an issue = split later (across year)
      startDate: new Date(`${year - 1}-11-01`),
      endDate: new Date(`${year}-01-31`),
      dueDate: new Date(`${year + 1}-02-28`)
    },
    summerQuarterTwo: {
      name: 'summerQuarterTwo',
      startDate: new Date(`${year + 1}-02-01`),
      endDate: new Date(`${year + 1}-04-30`),
      dueDate: new Date(`${year + 1}-05-28`)
    },
    summerQuarterThree: {
      name: 'summerQuarterThree',
      startDate: new Date(`${year + 1}-05-01`),
      endDate: new Date(`${year + 1}-07-31`),
      dueDate: new Date(`${year + 1}-08-28`)
    },
    summerQuarterFour: {
      name: 'summerQuarterFour',
      startDate: new Date(`${year + 1}-08-01`),
      endDate: new Date(`${year + 1}-10-31`),
      dueDate: new Date(`${year + 1}-11-28`)
    }
  }
}

/**
 * Get the current return period based on the given date.
 *
 * @param {Date} date - The date to find the current period for.
 * @returns {object} - The current return period.
 */
function currentReturnPeriod(date) {
  const sortedPeriods = _sortedReturnPeriods(date)
  return _findClosestPeriod(date, sortedPeriods)
}

/**
 * Get the next return period based on the given date.
 *
 * @param {Date} date - The date to find the next period for.
 * @returns {object} - The next return period.
 */
function nextReturnPeriod(date) {
  const sortedPeriods = _sortedReturnPeriods(date)
  const closestPeriod = _findClosestPeriod(date, sortedPeriods)
  const currentIndex = sortedPeriods.findIndex((period) => period === closestPeriod)
  return sortedPeriods[(currentIndex + 1) % sortedPeriods.length]
}

/**
 * Get the sorted return periods based on the given date.
 *
 * @param {Date} date - The date to generate the periods for.
 * @returns {Array} - The sorted array of return periods.
 */
function _sortedReturnPeriods(date) {
  return Object.values(periods(date)).sort((a, b) => a.dueDate - b.dueDate)
}

/**
 * Find the closest period to the given date.
 *
 * @param {Date} date - The date to compare.
 * @param {Array} sortedPeriods - The sorted array of periods.
 * @returns {object} - The closest period.
 */
function _findClosestPeriod(date, sortedPeriods) {
  return sortedPeriods.reduce((closest, period) => {
    const diff = Math.abs(period.dueDate - date)
    const closestDiff = Math.abs(closest.dueDate - date)
    return diff < closestDiff ? period : closest
  })
}

module.exports = {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate,
  periods,
  currentReturnPeriod,
  nextReturnPeriod
}
