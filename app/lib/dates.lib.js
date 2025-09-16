'use strict'

/**
 * Date helper methods
 * @module DatesLib
 */

const APRIL = 3
const FEBRUARY = 2
const LAST_DAY_OF_FEB_STANDARD_YEAR = 28
const LAST_DAY_OF_FEB_LEAP_YEAR = 29

/**
 * Creates an array of day objects, each representing a single day within the given period.
 *
 * This function iterates through each day between the period start and end date (inclusive), creating an object for
 * each day with the same start and end date.
 *
 * @param {Date} periodStartDate - The start date of the period.
 * @param {Date} periodEndDate - The end date of the period.
 *
 * @returns {object[]} An array of day objects, each containing startDate and endDate properties.
 */
function daysFromPeriod(periodStartDate, periodEndDate) {
  const days = []

  // We have to clone the date, else as we increment in the loop we'd be incrementing the param passed in!
  const clonedPeriodStartDate = _cloneDate(periodStartDate)

  while (clonedPeriodStartDate <= periodEndDate) { // eslint-disable-line
    // Clone the date again for the same reason above
    const startDate = _cloneDate(clonedPeriodStartDate)

    // No jiggery-pokery needed. Simply add it to the days array as both the start and end date
    days.push({ startDate, endDate: startDate })

    // Move the date to the next day, and round we go again!
    clonedPeriodStartDate.setDate(clonedPeriodStartDate.getDate() + 1)
  }

  return days
}

/**
 * Determine the financial year end for a given date
 *
 * The financial year runs from April 1st to March 31st. If the given date falls on or after April 1st,
 * the financial year end will be in the following calendar year. Otherwise, it remains in the current year.
 *
 * @param {Date} date - The date to determine the financial year for
 *
 * @returns {number} The year in which the financial year ends
 */
function determineFinancialYearEnd(date) {
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  return year
}

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
 * Format the provided date in ISO format.
 *
 * @param {Date | string } date - a date object to be formatted
 * @returns {Date | null} - the date formatted in YYYY-MM-DD.
 */
function formatDateObjectToISO(date) {
  if (!date) {
    return null
  }

  const localDate = new Date(date)

  return localDate.toISOString().split('T')[0]
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

/**
 * Creates an array of month objects, each representing a full calendar month within the given period.
 *
 * If the `periodStartDate` is not the first day of the month, the start date is adjusted backwards to the 1st of that
 * month to ensure the first full month is included. If the `periodEndDate` falls before the end of a month, the end
 * date is pushed forward to the end of the month.
 *
 * @param {Date} periodStartDate - The start date of the period.
 * @param {Date} periodEndDate - The end date of the period.
 *
 * @returns {object[]} An array of month objects, each containing `startDate` and `endDate` properties representing full
 * months.
 */
function monthsFromPeriod(periodStartDate, periodEndDate) {
  const months = []

  // We have to clone the date, else as we increment in the loop we'd be incrementing the param passed in!
  const clonedPeriodStartDate = _cloneDate(periodStartDate)

  while (clonedPeriodStartDate < periodEndDate) { // eslint-disable-line
    // Bump the returnLogStartDate to the next month, for example 2013-04-15 becomes 2013-05-15
    clonedPeriodStartDate.setMonth(clonedPeriodStartDate.getMonth() + 1)

    // Then clone that for our end date. "But we want the last day in April!?" we hear you scream :-)
    const endDate = _cloneDate(clonedPeriodStartDate)

    // We use some JavaScript magic to move endDate back to the last of the month. By setting the date (the 01, 02, 03
    // etc part) to 0, it's the equivalent of setting it to the 1st, then asking JavaScript to minus 1 day. That's
    // how we get to 2013-04-30. It also means we don't need to worry about which months have 30 vs 31 days, or whether
    // we are in a leap year!
    endDate.setDate(0)

    // Set start date to first of the month. Passing it in as a string to new Date() helps keep it UTC rather than local
    const startDate = new Date(`${endDate.getFullYear()}-${endDate.getMonth() + 1}-01`)

    months.push({ startDate, endDate })
  }

  return months
}

/**
 * Creates an array of week objects, each representing a single week within the given period.
 *
 * A full week starts on Sunday and ends on the following Saturday. If the `periodStartDate` does not fall on a Sunday,
 * the start date is adjusted backwards to the previous Sunday to ensure the first full week is included. If the
 * `periodEndDate` does not complete a full week, the partial week at the end is excluded.
 *
 * @param {Date} periodStartDate - The start date of the period.
 * @param {Date} periodEndDate - The end date of the period.
 *
 * @returns {object[]} An array of week objects, each containing startDate and endDate properties.
 */
function weeksFromPeriod(periodStartDate, periodEndDate) {
  const weeks = []

  // We have to clone the date, else as we increment in the loop we'd be incrementing the param passed in!
  const clonedPeriodStartDate = _cloneDate(periodStartDate)

  while (clonedPeriodStartDate <= periodEndDate) { // eslint-disable-line
    // Is the date a Saturday?
    if (clonedPeriodStartDate.getDay() === 6) {
      // Yes! Clone the date again for the same reason above
      const endDate = _cloneDate(clonedPeriodStartDate)
      const startDate = _cloneDate(clonedPeriodStartDate)

      // Set the start date back to 6 days, which makes it the previous Sunday
      startDate.setDate(startDate.getDate() - 6)

      weeks.push({ startDate, endDate })

      // Now we have found our first week, we can just move the date forward by 6 days to the next Saturday, thus saving
      // a bunch of loop iterations
      clonedPeriodStartDate.setDate(clonedPeriodStartDate.getDate() + 6)
    } else {
      // Move the date to the next day, and try again!
      clonedPeriodStartDate.setDate(clonedPeriodStartDate.getDate() + 1)
    }
  }

  return weeks
}

/**
 * Depending on how you instantiate a date in JavaScript, it will set the time element to either UTC or whatever the
 * locale is.
 *
 * For example, create one date by missing in another date, and you'll see the time set according to local time (GMT or
 * BST). Create one using a string, for example, `new Date('2024-04-01') and it will use UTC as the locale for the time
 * element.
 *
 * We only want to be working with UTC dates to avoid any issues, but there are times we need to clone a date to avoid
 * making changes to the original. To ensure our cloned date is also UTC, we have this method.
 * @private
 */
function _cloneDate(dateToClone) {
  const year = dateToClone.getFullYear()
  const month = dateToClone.getMonth() + 1
  const day = dateToClone.getDate()

  return new Date(`${year}-${month}-${day}`)
}

module.exports = {
  daysFromPeriod,
  determineFinancialYearEnd,
  determineEarliestDate,
  determineLatestDate,
  formatDateObjectToISO,
  formatStandardDateToISO,
  isISODateFormat,
  isQuarterlyReturnSubmissions,
  isValidDate,
  monthsFromPeriod,
  weeksFromPeriod
}
