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
 * Formats a value in pence as a money string with commas, for example, 12776805 as '£127,768.05'
 *
 * This is intended for use when formatting values to be displayed in the UI. In most cases if the value is a negative
 * it will be made a positive before then being formatted. This is because the UI generally shows credits as
 * '£127,768.05 credit' rather than '-£127,768.05'.
 *
 * But there are times when we need to show credits with a sign instead. In those cases you can pass the optional
 * `signed` flag to have the value returned with a sign.
 *
 * > Credit to https://stackoverflow.com/a/32154217/6117745 for showing numbers with commas
 *
 * @param {Number} valueInPence The value (in pence) to display as money
 * @param {Boolean} signed Whether to add the - sign to the start of the returned string if valueInPence is negative
 *
 * @returns {string} The value formatted as a money string with commas and currency symbol plus optional sign
 */
function formatMoney (valueInPence, signed = false) {
  // NOTE: The legacy DB stores values signed (which you should never do!) We always abs the valueInPence for 2 reasons
  //
  // - in most cases we display credits as £127,768.05 credit
  // - if we call `toLocaleString()` on a negative number we'll get a signed number back resulting in £-127,768.05
  const positiveValueInPence = Math.abs(valueInPence)
  const positiveValueInPounds = convertPenceToPounds(positiveValueInPence)

  // Determine if we should add a sign (the caller said they want one and the original value in pence was negative)
  const sign = signed && valueInPence < 0 ? '-' : ''

  return `${sign}£${positiveValueInPounds.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Formats a number, which represents a value in pence to pounds, for example, 12776805 as '127768.05'
 *
 * @param {*} valueInPence The value to be formatted to pounds
 *
 * @returns {string} The value converted to pounds and formatted to two decimal places
 */
function formatPounds (valueInPence) {
  const valueInPounds = convertPenceToPounds(valueInPence)

  return valueInPounds.toFixed(2)
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
  formatMoney,
  formatPounds,
  leftPadZeroes
}
