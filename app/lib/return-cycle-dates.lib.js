'use strict'

/**
 * Helper methods to deal with return cycle dates
 * @module ReturnCycleDatesLib
 */

const { formatDateObjectToISO } = require('./dates.lib.js')
const { returnCycleDates } = require('./static-lookups.lib.js')

/**
 * Get the due date of next provided cycle, either summer or winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the due date of the next cycle as an ISO string.
 */
function cycleDueDateAsISO(summer) {
  return formatDateObjectToISO(cycleDueDate(summer))
}

/**
 * Get the due date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the due date of the next cycle.
 */
function cycleDueDate(summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  let cycleDueYear
  let cycleDueMonth
  let cycleDueDay

  if (summer) {
    cycleDueDay = returnCycleDates.summer.dueDate.day
    cycleDueMonth = returnCycleDates.summer.dueDate.month + 1

    cycleDueYear = month > returnCycleDates.summer.endDate.month ? year + 1 : year
  } else {
    cycleDueDay = returnCycleDates.allYear.dueDate.day
    cycleDueMonth = returnCycleDates.allYear.dueDate.month + 1

    cycleDueYear = month > returnCycleDates.allYear.endDate.month ? year + 1 : year
  }

  const dueDate = new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)

  return dueDate
}

/**
 * Given an arbitary date and if it is summer or all-year return the due date of that cycle
 *
 * @param {Date} date - the date whose due date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the due date of the next cycle.
 */
function cycleDueDateByDate(date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  let cycleDueYear
  let cycleDueMonth
  let cycleDueDay

  if (summer) {
    cycleDueDay = returnCycleDates.summer.dueDate.day
    cycleDueMonth = returnCycleDates.summer.dueDate.month + 1

    cycleDueYear = month > returnCycleDates.summer.endDate.month ? year + 1 : year
  } else {
    cycleDueDay = returnCycleDates.allYear.dueDate.day
    cycleDueMonth = returnCycleDates.allYear.dueDate.month + 1

    cycleDueYear = month > returnCycleDates.allYear.endDate.month ? year + 1 : year
  }

  const dueDate = new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)

  return formatDateObjectToISO(dueDate)
}

/**
 * Get the end date of next provided cycle, either summer or winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the end date of the next cycle as an ISO string.
 */
function cycleEndDateAsISO(summer) {
  return formatDateObjectToISO(cycleEndDate(summer))
}

/**
 * Get the end date of next provided cycle, either summer and winter or all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the end date of the next cycle.
 */
function cycleEndDate(summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  let cycleEndYear
  let cycleEndMonth
  let cycleEndDay

  if (summer) {
    cycleEndDay = returnCycleDates.summer.endDate.day
    cycleEndMonth = returnCycleDates.summer.endDate.month + 1

    cycleEndYear = month > returnCycleDates.summer.endDate.month ? year + 1 : year
  } else {
    cycleEndDay = returnCycleDates.allYear.endDate.day
    cycleEndMonth = returnCycleDates.allYear.endDate.month + 1

    cycleEndYear = month > returnCycleDates.allYear.endDate.month ? year + 1 : year
  }

  const endDate = new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)

  return endDate
}

/**
 * Given an arbitrary date and if it is summer or all-year return the end date of that cycle
 *
 * @param {Date} date - the date whose start date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleEndDateByDate(date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  let cycleEndYear
  let cycleEndMonth
  let cycleEndDay

  if (summer) {
    cycleEndDay = returnCycleDates.summer.endDate.day
    cycleEndMonth = returnCycleDates.summer.endDate.month + 1

    cycleEndYear = month > returnCycleDates.summer.endDate.month ? year + 1 : year
  } else {
    cycleEndDay = returnCycleDates.allYear.endDate.day
    cycleEndMonth = returnCycleDates.allYear.endDate.month + 1

    cycleEndYear = month > returnCycleDates.allYear.endDate.month ? year + 1 : year
  }

  const endDate = new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)

  return formatDateObjectToISO(endDate)
}

/**
 * Get the start date of next provided cycle, either summer and winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the start date of the next cycle as an ISO string.
 */
function cycleStartDateAsISO(summer) {
  return formatDateObjectToISO(cycleStartDate(summer))
}

/**
 * Get the start date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleStartDate(summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  let cycleStartYear
  let cycleStartMonth
  let cycleStartDay

  if (summer) {
    cycleStartDay = returnCycleDates.summer.startDate.day
    cycleStartMonth = returnCycleDates.summer.startDate.month + 1

    cycleStartYear = month < returnCycleDates.summer.startDate.month ? year - 1 : year
  } else {
    cycleStartDay = returnCycleDates.allYear.startDate.day
    cycleStartMonth = returnCycleDates.allYear.startDate.month + 1

    cycleStartYear = month < returnCycleDates.allYear.startDate.month ? year - 1 : year
  }

  const startDate = new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)

  return startDate
}

/**
 * Given an arbitary date and if it is summer or all-year return the start date of that cycle
 *
 * @param {Date} date - the date whose start date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleStartDateByDate(date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  let cycleStartYear
  let cycleStartMonth
  let cycleStartDay

  if (summer) {
    cycleStartDay = returnCycleDates.summer.startDate.day
    cycleStartMonth = returnCycleDates.summer.startDate.month + 1

    cycleStartYear = month < returnCycleDates.summer.startDate.month ? year - 1 : year
  } else {
    cycleStartDay = returnCycleDates.allYear.startDate.day
    cycleStartMonth = returnCycleDates.allYear.startDate.month + 1

    cycleStartYear = month < returnCycleDates.allYear.startDate.month ? year - 1 : year
  }

  const startDate = new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)

  return formatDateObjectToISO(startDate)
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
  cycleDueDate,
  cycleDueDateByDate,
  cycleDueDateAsISO,
  cycleEndDate,
  cycleEndDateByDate,
  cycleEndDateAsISO,
  cycleStartDate,
  cycleStartDateByDate,
  cycleStartDateAsISO,
  periods,
  currentReturnPeriod,
  nextReturnPeriod
}
