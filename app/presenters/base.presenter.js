'use strict'

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
  formatChargingModuleDate,
  formatLongDate,
  leftPadZeroes
}
