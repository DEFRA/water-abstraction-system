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
 * Get the due date of next provided cycle, either summer or winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the due date of the next cycle as an ISO string.
 */
function cycleDueDateAsISO (summer) {
  return formatDateObjectToISO(cycleDueDate(summer))
}

/**
 * Get the due date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the due date of the next cycle.
 */
function cycleDueDate (summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return new Date(year + 1, returnCycleDates.summer.dueDate.month, returnCycleDates.summer.dueDate.day)
    }

    return new Date(year, returnCycleDates.summer.dueDate.month, returnCycleDates.summer.dueDate.day)
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return new Date(year + 1, returnCycleDates.allYear.dueDate.month, returnCycleDates.allYear.dueDate.day)
  }

  return new Date(year, returnCycleDates.allYear.dueDate.month, returnCycleDates.allYear.dueDate.day)
}

/**
 * Given an arbitary date and if it is summer or all-year return the due date of that cycle
 *
 * @param {Date} date - the date whose due date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the due date of the next cycle.
 */
function cycleDueDateByDate (date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.summer.dueDate.month + 1}-${returnCycleDates.summer.dueDate.day}`))
    }

    return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.summer.dueDate.month + 1}-${returnCycleDates.summer.dueDate.day}`))
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.allYear.dueDate.month + 1}-${returnCycleDates.allYear.dueDate.day}`))
  }

  return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.allYear.dueDate.month + 1}-${returnCycleDates.allYear.dueDate.day}`))
}

/**
 * Get the end date of next provided cycle, either summer or winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the end date of the next cycle as an ISO string.
 */
function cycleEndDateAsISO (summer) {
  return formatDateObjectToISO(cycleEndDate(summer))
}

/**
 * Get the end date of next provided cycle, either summer and winter or all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the end date of the next cycle.
 */
function cycleEndDate (summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return new Date(year + 1, returnCycleDates.summer.endDate.month, returnCycleDates.summer.endDate.day)
    }

    return new Date(year, returnCycleDates.summer.endDate.month, returnCycleDates.summer.endDate.day)
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return new Date(year + 1, returnCycleDates.allYear.endDate.month, returnCycleDates.allYear.endDate.day)
  }

  return new Date(year, returnCycleDates.allYear.endDate.month, returnCycleDates.allYear.endDate.day)
}

/**
 * Given an arbitary date and if it is summer or all-year return the end date of that cycle
 *
 * @param {Date} date - the date whose start date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleEndDateByDate (date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (summer) {
    if (month > returnCycleDates.summer.endDate.month) {
      return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.summer.endDate.month + 1}-${returnCycleDates.summer.endDate.day}`))
    }

    return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.summer.endDate.month + 1}-${returnCycleDates.summer.endDate.day}`))
  }

  if (month > returnCycleDates.allYear.endDate.month) {
    return formatDateObjectToISO(new Date(`${year + 1}-${returnCycleDates.allYear.endDate.month + 1}-${returnCycleDates.allYear.endDate.day}`))
  }

  return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.allYear.endDate.month + 1}-${returnCycleDates.allYear.endDate.day}`))
}

/**
 * Get the start date of next provided cycle, either summer and winter and all year, formatted as YYYY-MM-DD
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {string} - the start date of the next cycle as an ISO string.
 */
function cycleStartDateAsISO (summer) {
  return formatDateObjectToISO(cycleStartDate(summer))
}

/**
 * Get the start date of next provided cycle, either summer or winter and all year
 *
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleStartDate (summer) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  if (summer) {
    if (month < returnCycleDates.summer.startDate.month) {
      return new Date(year - 1, returnCycleDates.summer.startDate.month, returnCycleDates.summer.startDate.day)
    }

    return new Date(year, returnCycleDates.summer.startDate.month, returnCycleDates.summer.startDate.day)
  }

  if (month < returnCycleDates.allYear.startDate.month) {
    return new Date(year - 1, returnCycleDates.allYear.startDate.month, returnCycleDates.allYear.startDate.day)
  }

  return new Date(year, returnCycleDates.allYear.startDate.month, returnCycleDates.allYear.startDate.day)
}

/**
 * Given an arbitary date and if it is summer or all-year return the start date of that cycle
 *
 * @param {Date} date - the date whose start date you want to find.
 * @param {boolean} summer - true for summer, false for winter and all year.
 * @returns {Date} - the start date of the next cycle.
 */
function cycleStartDateByDate (date, summer) {
  const year = date.getFullYear()
  const month = date.getMonth()

  if (summer) {
    if (month < returnCycleDates.summer.startDate.month) {
      return formatDateObjectToISO(new Date(`${year - 1}-${returnCycleDates.summer.startDate.month + 1}-${returnCycleDates.summer.startDate.day}`))
    }

    return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.summer.startDate.month + 1}-${returnCycleDates.summer.startDate.day}`))
  }

  if (month < returnCycleDates.allYear.startDate.month) {
    return formatDateObjectToISO(new Date(`${year - 1}-${returnCycleDates.allYear.startDate.month + 1}-${returnCycleDates.allYear.startDate.day}`))
  }

  return formatDateObjectToISO(new Date(`${year}-${returnCycleDates.allYear.startDate.month + 1}-${returnCycleDates.allYear.startDate.day}`))
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

module.exports = {
  formatDateObjectToISO,
  formatStandardDateToISO,
  cycleDueDate,
  cycleDueDateByDate,
  cycleDueDateAsISO,
  cycleEndDate,
  cycleEndDateByDate,
  cycleEndDateAsISO,
  cycleStartDate,
  cycleStartDateByDate,
  cycleStartDateAsISO,
  isISODateFormat,
  isValidDate
}
