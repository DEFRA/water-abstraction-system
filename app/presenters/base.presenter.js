'use strict'

/**
 * Converts a number which represents pence into pounds by dividing it by 100
 *
 * This is such a simply calculation it could be done in place. But by having it as a named method we make it clear
 * what we are doing rather than those that follow having to derive the intent.
 *
 * @param {number} value
 *
 * @returns {number} the value divided by 100
 */
function convertPenceToPounds(value) {
  return value / 100
}

/**
 * Generates the page title for a bill run, for example, 'Anglian supplementary'
 *
 * Typically the page title when viewing a bill run is the region name followed by the bill run type. We determine the
 * bill run type using the bill run's batch type, scheme and in the case of two-part tariff PRESROC bill runs, whether
 * it is summer only or not.
 *
 * @param {string} regionName - Name of the region the bill run is for
 * @param {string} batchType - The type of bill run; annual, supplementary or two_part_tariff
 * @param {string} scheme - Whether the bill run is PRESROC (alcs) or SROC (sroc)
 * @param {boolean} summer - Applies to PRESROC two-part tariff bill runs. Whether the bill run is for summer only
 *
 * @returns The bill run title to use in bill run pages
 */
function generateBillRunTitle(regionName, batchType, scheme, summer) {
  const billRunType = formatBillRunType(batchType, scheme, summer)

  return `${titleCase(regionName)} ${billRunType.toLowerCase()}`
}

/**
 * Formats an abstraction day and month into its string variant, for example, 1 and 4 becomes '1 April'
 *
 * If either value is null or undefined, it returns null.
 *
 * @param {number} abstractionDay
 * @param {number} abstractionMonth - Note: the index starts at 1, for example, 4 would be April
 *
 * @returns {string|null} The abstraction date formatted as a 'DD MMMM' string or null if either value is not set
 */
function formatAbstractionDate(abstractionDay, abstractionMonth) {
  if (!abstractionDay || !abstractionMonth) {
    return null
  }

  // NOTE: Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
  // January is actually 0, February is 1 etc. This is why we are always deducting 1 from the months.
  const abstractionDate = new Date(1970, abstractionMonth - 1, abstractionDay)

  return abstractionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

/**
 * Formats an abstraction period into its string variant, for example, '1 April to 31 October'
 *
 * If the provided abstraction data is null or undefined, it returns null.
 *
 * @param {number} startDay
 * @param {number} startMonth
 * @param {number} endDay
 * @param {number} endMonth
 *
 * @returns {string} The abstraction period formatted as a 'DD MMMM to DD MMMM' string, unless the abstraction period
 * cannot be determined, in which case it returns null
 */
function formatAbstractionPeriod(startDay, startMonth, endDay, endMonth) {
  const startDate = formatAbstractionDate(startDay, startMonth)
  const endDate = formatAbstractionDate(endDay, endMonth)

  if (!startDate || !endDate) {
    return null
  }

  return `${startDate} to ${endDate}`
}

/**
 * Formats how the bill run type for display in views
 *
 * @param {string} batchType - The type of bill run; annual, supplementary, two_part_tariff or two_part_supplementary
 * @param {string} scheme - Whether the bill run is PRESROC (alcs) or SROC (sroc)
 * @param {boolean} summer - Applies to PRESROC two-part tariff bill runs. Whether the bill run is for summer only
 *
 * @returns {string} The bill run type formatted for display
 */
function formatBillRunType(batchType, scheme, summer) {
  if (!['two_part_tariff', 'two_part_supplementary'].includes(batchType)) {
    return titleCase(batchType)
  }

  if (batchType === 'two_part_supplementary') {
    return 'Two-part tariff supplementary'
  }

  if (scheme === 'sroc') {
    return 'Two-part tariff'
  }

  if (summer) {
    return 'Two-part tariff summer'
  }

  return 'Two-part tariff winter and all year'
}

/**
 * Converts a date into the format required by the Charging Module, eg 25/03/2021 becomes 25-MAR-2021
 *
 * @param {Date} date - The date to be formatted
 *
 * @returns {string} The date formatted as a 'DD-MMM-YYYY' string
 */
function formatChargingModuleDate(date) {
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
 * Formats a bill run's scheme (alcs or sroc) for display in a view (Old or Current)
 *
 * @param {string} scheme - The bill run scheme to format
 *
 * @returns {string} The scheme formatted for display
 */
function formatChargeScheme(scheme) {
  if (scheme === 'sroc') {
    return 'Current'
  }

  return 'Old'
}

/**
 * Formats the financial year ending of a bill run for display in a view
 *
 * If a bill runs financial year ending is 2024 this function will return '2023 to 2024'.
 *
 * @param {number} financialYearEnding - The financial year ending of the bill run
 *
 * @returns {string} The financial year ending formatted for display
 */
function formatFinancialYear(financialYearEnding) {
  return `${financialYearEnding - 1} to ${financialYearEnding}`
}

/**
 * Formats a date into a human readable day, month and year string, for example, '12 September 2021'
 *
 * @param {Date} date - The date to be formatted
 *
 * @returns {string} The date formatted as a 'DD MMMM YYYY' string
 */
function formatLongDate(date) {
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Formats a date into a human readable day, month, year and time string, for example, '12 September 2021 at 21:43:44'
 *
 * @param {Date} date - The date to be formatted
 *
 * @returns {string} The date formatted as a 'DD MMMM YYYY at HH:MM:SS' string
 */
function formatLongDateTime(date) {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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
 * @param {number} valueInPence - The value (in pence) to display as money
 * @param {boolean} signed - Whether to add the - sign to the start of the returned string if valueInPence is negative
 *
 * @returns {string} The value formatted as a money string with commas and currency symbol plus optional sign
 */
function formatMoney(valueInPence, signed = false) {
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
 * @param {*} valueInPence - The value to be formatted to pounds
 *
 * @returns {string} The value converted to pounds and formatted to two decimal places
 */
function formatPounds(valueInPence) {
  const valueInPounds = convertPenceToPounds(valueInPence)

  return valueInPounds.toFixed(2)
}

/**
 * Pads a number to a given length with leading zeroes and returns the result as a string
 *
 * @param {number} number - The number to be padded
 * @param {number} length - How many characters in length the final string should be
 *
 * @returns {string} The number padded with zeros to the specified length
 */
function leftPadZeroes(number, length) {
  return number.toString().padStart(length, '0')
}

/**
 * Convert a string to sentence case by lowercasing all characters then capitalizing the first letter
 *
 * Will work for strings containing multiple words or only one.
 *
 * @param {string} value - The string to title case
 *
 * @returns {string} The title cased string
 */
function sentenceCase(value) {
  const sentence = value.toLowerCase()

  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

/**
 * Convert a string to title case by capitalizing the first letter of each word
 *
 * Will work for strings containing multiple words or only one.
 *
 * @param {string} value - The string to title case
 *
 * @returns {string} The title cased string
 */
function titleCase(value) {
  const words = value.split(' ')
  const titleCasedWords = []

  words.forEach((word) => {
    const titleCasedWord = word.charAt(0).toUpperCase() + word.slice(1)

    titleCasedWords.push(titleCasedWord)
  })

  return titleCasedWords.join(' ')
}

module.exports = {
  convertPenceToPounds,
  generateBillRunTitle,
  formatAbstractionDate,
  formatAbstractionPeriod,
  formatBillRunType,
  formatChargingModuleDate,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate,
  formatLongDateTime,
  formatMoney,
  formatPounds,
  leftPadZeroes,
  sentenceCase,
  titleCase
}
