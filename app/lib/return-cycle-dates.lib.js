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
function cycleDueDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _summerDueDate(determinationDate)
  }

  return _allYearDueDate(determinationDate)
}

/**
 * Determine the end date of next provided cycle, either summer and winter or all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year
 * @param {Date} [determinationDate] - the date by which to determine the cycle's 'end date' (defaults to current date)
 *
 * @returns {Date} the end date of the next cycle
 */
function cycleEndDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _summerEndDate(determinationDate)
  }

  return _allYearEndDate(determinationDate)
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
function cycleStartDate(summer, determinationDate = new Date()) {
  if (summer) {
    return _summerStartDate(determinationDate)
  }

  return _allYearStartDate(determinationDate)
}

/**
 * Given an arbitrary date and if it is summer or all-year return the start date of that cycle
 *
 * @param {Date} date - the date whose start date you want to find
 * @param {boolean} summer - true for summer, false for winter and all year
 *
 * @returns {Date} the start date of the next cycle.
 */
function cycleStartDateByDate(date, summer) {
  if (summer) {
    return _summerStartDate(date)
  }

  return _allYearStartDate(date)
}

function _allYearDueDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const cycleDueDay = returnCycleDates.allYear.dueDate.day
  const cycleDueMonth = returnCycleDates.allYear.dueDate.month + 1
  const cycleDueYear = month > returnCycleDates.allYear.endDate.month ? year + 1 : year

  return new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)
}

function _allYearEndDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const cycleEndDay = returnCycleDates.allYear.endDate.day
  const cycleEndMonth = returnCycleDates.allYear.endDate.month + 1
  const cycleEndYear = month > returnCycleDates.allYear.endDate.month ? year + 1 : year

  return new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)
}

function _allYearStartDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const cycleStartDay = returnCycleDates.allYear.startDate.day
  const cycleStartMonth = returnCycleDates.allYear.startDate.month + 1
  const cycleStartYear = month < returnCycleDates.allYear.startDate.month ? year - 1 : year

  return new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)
}

function _summerDueDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const cycleDueDay = returnCycleDates.summer.dueDate.day
  const cycleDueMonth = returnCycleDates.summer.dueDate.month + 1
  const cycleDueYear = month > returnCycleDates.summer.endDate.month ? year + 1 : year

  return new Date(`${cycleDueYear}-${cycleDueMonth}-${cycleDueDay}`)
}

function _summerEndDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const cycleEndDay = returnCycleDates.summer.endDate.day
  const cycleEndMonth = returnCycleDates.summer.endDate.month + 1
  const cycleEndYear = month > returnCycleDates.summer.endDate.month ? year + 1 : year

  return new Date(`${cycleEndYear}-${cycleEndMonth}-${cycleEndDay}`)
}

function _summerStartDate(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const cycleStartDay = returnCycleDates.summer.startDate.day
  const cycleStartMonth = returnCycleDates.summer.startDate.month + 1
  const cycleStartYear = month < returnCycleDates.summer.startDate.month ? year - 1 : year

  return new Date(`${cycleStartYear}-${cycleStartMonth}-${cycleStartDay}`)
}

module.exports = {
  cycleDueDate,
  cycleEndDate,
  cycleStartDate,
  cycleStartDateByDate
}
