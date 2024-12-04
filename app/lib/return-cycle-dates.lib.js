'use strict'

/**
 * Helper methods to deal with return cycle dates
 * @module ReturnCycleDatesLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')

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

  return new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)
}

/**
 * Given an arbitrary date and if it is summer or all-year return the due date of that cycle
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

  return new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)
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

  return new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)
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

  return new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)
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

  return new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)
}

/**
 * Given an arbitrary date and if it is summer or all-year return the start date of that cycle
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

  return new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)
}

module.exports = {
  cycleDueDate,
  cycleDueDateByDate,
  cycleEndDate,
  cycleEndDateByDate,
  cycleStartDate,
  cycleStartDateByDate
}
