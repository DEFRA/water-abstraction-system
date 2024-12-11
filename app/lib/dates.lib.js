'use strict'

/**
 * Date helper methods
 * @module DatesLib
 */

const FEBRUARY = 2
const LAST_DAY_OF_FEB_STANDARD_YEAR = 28
const LAST_DAY_OF_FEB_LEAP_YEAR = 29

/**
 * From an array of dates, filter out empty values and return the earliest
 *
 * This was created as part of our work on generating return logs for licences, and needing to work out the earliest
 * end date between the licence's expired, lapsed and revoked end dates, the return version's end date, and the return
 * cycle's end date.
 *
 * @param {Date[]} dates - The dates from which to select the earliest
 *
 * @returns {Date} The earliest date
 */
function determineEarliestDate(dates) {
  const allEmptyValuesRemoved = dates.filter((date) => {
    return date
  })

  if (allEmptyValuesRemoved.length === 0) {
    return null
  }

  const earliestDateTimestamp = Math.min(...allEmptyValuesRemoved)

  return new Date(earliestDateTimestamp)
}

/**
 * From an array of dates, filter out empty values and return the latest as a `Date`
 *
 * This was created as part of our work on generating return logs for licences, and needing to work out the latest end
 * date between the licence start date, the return version start date, and the return cycle start date.
 *
 * @param {Date[]} dates - The dates from which to select the latest
 *
 * @returns {Date} The latest date
 */
function determineLatestDate(dates) {
  const allEmptyValuesRemoved = dates.filter((date) => {
    return date
  })

  if (allEmptyValuesRemoved.length === 0) {
    throw Error('No dates provided to determine earliest')
  }

  const valuesAsDates = allEmptyValuesRemoved.map((date) => {
    return new Date(date)
  })

  const latestDateTimestamp = Math.max(...valuesAsDates)

  return new Date(latestDateTimestamp)
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
function formatStandardDateToISO(date) {
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
function formatDateObjectToISO(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Check if a date is valid or not by creating a date and checking it gives the time
 *
 * @param {dateString | undefined } dateString - The date in the iso format 2001-01-01
 * @returns {boolean}
 */
function isValidDate(dateString) {
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
function isISODateFormat(dateString) {
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
function _isValidLeapYearDate(dateString) {
  const [year, month, day] = dateString.split('-')

  if (_isLeapYear(year) === true && Number(month) === FEBRUARY && Number(day) > LAST_DAY_OF_FEB_LEAP_YEAR) {
    return false
  }

  if (_isLeapYear(year) === false && Number(month) === FEBRUARY && Number(day) > LAST_DAY_OF_FEB_STANDARD_YEAR) {
    return false
  }

  return true
}

function _isLeapYear(year) {
  const set400 = 400

  if ((year % 4 === 0 && year % 100 !== 0) || year % set400 === 0) {
    return true
  }

  return false
}

/**
 * Checks if the given date is a quarterly returns submission
 *
 * A quarterly returns submission will be true when the date provided is >= 1 April 2025
 *
 * @param {string} date - The date to compare against the quarterly return submissions date
 *
 * @returns {boolean} - Will return true if the date is for a quarterly return submission
 *
 * @private
 */
function isQuarterlyReturnSubmissions(date) {
  return new Date(date).getTime() >= new Date('2025-04-01').getTime()
}

module.exports = {
  determineEarliestDate,
  determineLatestDate,
  formatDateObjectToISO,
  formatStandardDateToISO,
  isISODateFormat,
  isQuarterlyReturnSubmissions,
  isValidDate
}
