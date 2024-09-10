'use strict'

/**
 * General helper methods
 * @module DatesLib
 */

const { returnCycleDates } = require('./static-lookups.lib.js')

const february = 2
const lastDayOfFebruary = 28
const lastDayOfFebruaryLeapYear = 29

/**
 * Get the next summer return cycle due date.
 *
 * @returns {Date} the due date of the next summer return cycle
 */
function dueDateOfSummerCycle () {
  return new Date(new Date().getFullYear() + 1, returnCycleDates.summerDueDateMonth, returnCycleDates.summerDueDateDay)
}

/**
 * Get the next winter and all year cycle due date.
 *
 * @returns {Date} the due date of the next winter and all year return cycle
 */
function dueDateOfWinterAndAllYearCycle () {
  return new Date(new Date().getFullYear() + 1,
    returnCycleDates.allYearDueDateMonth,
    returnCycleDates.allYearDueDateDay
  )
}

/**
 * Get the next summer return cycle end date.
 *
 * @returns {Date} the end date of the next summer cycle
 */
function endOfSummerCycle () {
  return new Date(new Date().getFullYear() + 1, returnCycleDates.summerEndDateMonth, returnCycleDates.summerEndDateDay)
}

/**
 * Get the next winter and all year return cycle end date.
 *
 * @returns {Date} the end date of the next winter and all year cycle
 */
function endOfWinterAndAllYearCycle () {
  return new Date(new Date().getFullYear() + 1,
    returnCycleDates.allYearEndDateMonth,
    returnCycleDates.allYearEndDateDay
  )
}

/**
 * Formats a string assumed to be a date in the format 01/01/2001
 *
 * Formats to iso format 2001-01-01
 *
 * This will format a date that may not be valid as it is just string manipulation
 *
 * @param {string} date - The date in the format 01/01/2001
 * @returns {string | null} - a date in the iso format 2001-01-01
 */
function formatStandardDateToISO (date) {
  if (date === 'null' || date === null) {
    return null
  }

  const [day, month, year] = date.split('/')

  const isoDateString = `${year}-${month}-${day}`

  if (isValidDate(isoDateString)) {
    return isoDateString
  } else {
    throw new Error(`${isoDateString} is not a valid date`)
  }
}

/**
 * Formate the provided date in ISO format.
 *
 * @param {Date} date - a date object to be formatted
 * @returns {Date} - the date formatted in YYYY-MM-DD.
 */
function formatDateObjectToISO (date) {
  return date.toISOString().split('T')[0]
}

/**
 * Get the due date of next provided cycle. Either summer or winter or all year.
 *
 * @param {boolean} isSummer - true for summer, false for winter and all year.
 * @returns {Date} - the due date of the next cycle.
 */
function getCycleDueDate (isSummer) {
  return isSummer
    ? formatDateObjectToISO(dueDateOfSummerCycle())
    : formatDateObjectToISO(dueDateOfWinterAndAllYearCycle())
}

/**
 * Get the end date of next provided cycle. Either summer or winter or all year.
 *
 * @param {boolean} isSummer - true for summer, false for winter and all year.
 * @returns {Date} - the end date of the next cycle.
 */
function getCycleEndDate (isSummer) {
  return isSummer
    ? formatDateObjectToISO(endOfSummerCycle())
    : formatDateObjectToISO(endOfWinterAndAllYearCycle())
}

/**
 * Get the start date of next provided cycle. Either summer or winter or all year.
 *
 * @param {boolean} isSummer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function getCycleStartDate (isSummer) {
  return isSummer ? formatDateObjectToISO(startOfSummerCycle()) : formatDateObjectToISO(startOfWinterAndAllYearCycle())
}

/**
 * Check if a date is valid or not by creating a date and checking it gives the time
 *
 * @param {dateString | undefined } dateString - The date in the iso format 2001-01-01
 * @returns {boolean}
 */
function isValidDate (dateString) {
  if (!dateString) {
    return false
  }

  if (!_isValidLeapYearDate(dateString)) {
    return false
  }

  const date = new Date(dateString)

  return !isNaN(date.getTime())
}

/**
 * Checks a string matches the ISO 8601 date format
 *
 * @param {dateString} dateString - The date in the iso format 2001-01-01
 * @returns {boolean}
 */
function isISODateFormat (dateString) {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

  return isoDatePattern.test(dateString)
}

/**
 * Check if a date is a leap year
 *
 * Known issue in javascript - https://en.wikipedia.org/wiki/Leap_year_problem#:~:text=The%20following%20JavaScript%20code%20is,is%202021%2D03%2D01.
 *
 * This functions handles the valid and invalid leap year dates
 *
 * @param {dateString} dateString - The date in the iso format 2001-01-01
 * @returns {boolean}
 *
 * @private
 */
function _isValidLeapYearDate (dateString) {
  const [year, month, day] = dateString.split('-')

  if (_isLeapYear(year) === true && Number(month) === february && Number(day) > lastDayOfFebruaryLeapYear) {
    return false
  }

  if (_isLeapYear(year) === false && Number(month) === february && Number(day) > lastDayOfFebruary) {
    return false
  }

  return true
}

function _isLeapYear (year) {
  const set400 = 400

  if ((year % 4 === 0 && year % 100 !== 0) || (year % set400 === 0)) {
    return true
  }

  return false
}

/**
 * Get the next summer return cycle start date.
 *
 * @returns {Date} the start date of the next summer cycle
 */
function startOfSummerCycle () {
  return new Date(new Date().getFullYear(), returnCycleDates.summerStartDateMonth, returnCycleDates.summerStartDateDay)
}

/**
 * Get the next winter and all year return cycle start date.
 *
 * @returns {Date} the start date of the next winter and all year cycle
 */
function startOfWinterAndAllYearCycle () {
  return new Date(new Date().getFullYear(),
    returnCycleDates.allYearStartDateMonth,
    returnCycleDates.allYearStartDateDay
  )
}

module.exports = {
  dueDateOfSummerCycle,
  dueDateOfWinterAndAllYearCycle,
  endOfSummerCycle,
  endOfWinterAndAllYearCycle,
  formatDateObjectToISO,
  formatStandardDateToISO,
  getCycleDueDate,
  getCycleEndDate,
  getCycleStartDate,
  isISODateFormat,
  isValidDate,
  startOfSummerCycle,
  startOfWinterAndAllYearCycle
}
