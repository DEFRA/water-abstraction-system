'use strict'

/**
 * Capitalize the first letter of each word in a string
 *
 * Will work for strings containing multiple words or only one.
 *
 * @param {string} value The string to capitalize
 *
 * @returns {string} The capitalized string
 */
function capitalize (value) {
  const words = value.split(' ')
  const capitalizedWords = []

  words.forEach((word) => {
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1)
    capitalizedWords.push(capitalizedWord)
  })

  return capitalizedWords.join(' ')
}

/**
 * Converts a number which represents pence into pounds by dividing it by 100
 *
 * This is such a simply calculation it could be done in place. But by having it as a named method we make it clear
 * what we are doing rather than those that follow having to derive the intent.
 *
 * @param {Number} value
 *
 * @returns {Number} the value divided by 100
 */
function convertPenceToPounds (value) {
  return value / 100
}

/**
 * Formats an abstraction day and month into its string variant, for example, 1 and 4 becomes '1 April'
 *
 * @param {Number} abstractionDay
 * @param {Number} abstractionMonth Note: the index starts at 1, for example, 4 would be April
 *
 * @returns {string} The abstraction date formatted as a 'DD MMMM' string
 */
function formatAbstractionDate (abstractionDay, abstractionMonth) {
  // NOTE: Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
  // January is actually 0, February is 1 etc. This is why we are always deducting 1 from the months.
  const abstractionDate = new Date(1970, abstractionMonth - 1, abstractionDay)

  return abstractionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

/**
 * Formats an abstraction period into its string variant, for example, '1 April to 31 October'
 *
 * @param {Number} startDay
 * @param {Number} startMonth
 * @param {Number} endDay
 * @param {Number} endMonth
 *
 * @returns {string} The abstraction period formatted as a 'DD MMMM to DD MMMM' string
 */
function formatAbstractionPeriod (startDay, startMonth, endDay, endMonth) {
  const startDate = formatAbstractionDate(startDay, startMonth)
  const endDate = formatAbstractionDate(endDay, endMonth)

  return `${startDate} to ${endDate}`
}

/**
 * Converts a date into the format required by the Charging Module, eg 25/03/2021 becomes 25-MAR-2021
 *
 * @param {Date} date The date to be formatted
 *
 * @returns {string} The date formatted as a 'DD-MMM-YYYY' string
 */
function formatChargingModuleDate (date) {
  // The output date format of methods such as toLocaleString() are based on the Unicode CLDR which is subject to
  // change and cannot be relied on to be consistent: https://github.com/nodejs/node/issues/42030. We therefore
  // generate the formatted date ourselves.
  const unpaddedDay = date.getDate()
  const day = leftPadZeroes(unpaddedDay, 2)

  const monthStrings = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const month = monthStrings[date.getMonth()]

  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

/**
 * Formats a date into a human readable day, month and year string, for example, '12 September 2021'
 *
 * @param {Date} date The date to be formatted
 *
 * @returns {string} The date formatted as a 'DD MMMM YYYY' string
 */
function formatLongDate (date) {
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Formats a date into a human readable day, month, year and time string, for example, '12 September 2021 at 21:43:44'
 *
 * @param {Date} date The date to be formatted
 *
 * @returns {string} The date formatted as a 'DD MMMM YYYY at HH:MM:SS' string
 */
function formatLongDateTime (date) {
  return date.toLocaleDateString(
    'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
  )
}

/**
 * Formats a number which represents a value in pounds as a money string, for example, 1149 as '1149.00'
 *
 * @param {Number} value The value to display as currency. Assumed to be in pounds
 * @param {Boolean} includeSymbol Whether to add the £ symbol to the start of the returned string
 *
 * @returns {string} The value formatted as a money string with optional currency symbol
 */
function formatNumberAsMoney (value, includeSymbol = false) {
  const symbol = includeSymbol ? '£' : ''

  return `${symbol}${value.toFixed(2)}`
}

/**
 * Pads a number to a given length with leading zeroes and returns the result as a string
 *
 * @param {Number} number The number to be padded
 * @param {Number} length How many characters in length the final string should be
 *
 * @returns {string} The number padded with zeros to the specified length
 */
function leftPadZeroes (number, length) {
  return number
    .toString()
    .padStart(length, '0')
}

module.exports = {
  capitalize,
  convertPenceToPounds,
  formatAbstractionDate,
  formatAbstractionPeriod,
  formatChargingModuleDate,
  formatLongDate,
  formatLongDateTime,
  formatNumberAsMoney,
  leftPadZeroes
}
