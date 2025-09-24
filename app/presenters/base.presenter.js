'use strict'

const { today } = require('../lib/general.lib.js')
const { returnUnits } = require('../lib/static-lookups.lib.js')

const DUE_PERIOD_DAYS = 27

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
 * Formats a date into a human readable month and year string, for example, 'September 2021'
 *
 * @param {Date} date - The date to be formatted
 *
 * @returns {string} The date formatted as a 'MMMM YYYY' string
 */
function formatDateMonthYear(date) {
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })
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
 * @param {Date | string } date - The date to be formatted
 *
 * @returns {string | null} The date formatted as a 'DD MMMM YYYY' string
 */
function formatLongDate(date) {
  if (!date) {
    return null
  }

  const localDate = new Date(date)

  return localDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
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
 * Formats a number as a string with commas and decimal places, for example, 1000 as '1,000.000'
 *
 * @param {number} number - The number to format
 * @param {number} [minimumFractionDigits=0] - Minimum number of digits after the decimal point
 * @param {number} [maximumFractionDigits=3] - Maximum number of digits after the decimal point
 *
 * @returns {string|null} The formatted number or null if the number is null or undefined
 */
function formatNumber(number, minimumFractionDigits = 0, maximumFractionDigits = 3) {
  // NOTE: We don't use !number because that would match 0, which for this helper is a valid number and something we
  // want to format
  if (number === null) {
    return null
  }

  return number.toLocaleString('en-GB', { minimumFractionDigits, maximumFractionDigits })
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
 * Format the purposes for display on screen
 *
 * This function assumes that when provided the purposes are in the format:
 *
 * ```javascript
 * [{
 *  alias: 'manual description',
 *  primary: { code: 'A', description: 'Agriculture' },
 *  tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
 *  secondary: { code: 'AGR', description: 'General Agriculture' }
 * }]
 * ```
 *
 * It is possible that a return log has zero or more purposes associated it. If this is the case we need the description
 * of each purpose from the array of purposes to be concatenated into a single comma separated string ready to present.
 *
 * @param {Array} purposes - the purposes taken from the return logs metadata
 *
 * @returns {string} the purpose descriptions as a string, separated by commas if more than one description exists
 */
function formatPurposes(purposes) {
  if (!purposes || purposes.length === 0) {
    return ''
  }

  const purposeDescriptionArray = purposes.map((purpose) => {
    if (purpose.alias) {
      return `${purpose.tertiary.description} (${purpose.alias})`
    }

    return purpose.tertiary.description
  })

  return purposeDescriptionArray
}

/**
 * Converts a quantity in cubic metres to a given unit and formats it
 *
 * @param {string} units - the unit to convert the quantity to
 * @param {number} quantity - the quantity in cubic metres to be formatted
 *
 * @returns {string|null} The formatted quantity or null if the quantity is null or undefined
 */
function formatQuantity(units, quantity) {
  if (quantity === null || quantity === undefined) {
    return null
  }

  const convertedQuantity = quantity * returnUnits[units].multiplier

  return formatNumber(convertedQuantity)
}

/**
 * Formats the status for a return log, adjusting for specific conditions.
 *
 * - NOT DUE YET - The return log end date is greater than or equal to the current date. Cannot be submitted or
 * received.
 * - OPEN - The return log end date is less than the current date, its DB status is 'due', and it either has a due date
 * more than 28 days in the future, or it is null.
 * - DUE - The return log end date is less than the current date, its DB status is 'due', and it has a due date less
 * than or equal to 28 days in the future.
 * - OVERDUE - The return log end date is less than the current date, its DB status is 'due', and it has a due date
 * greater than the current date.
 * - RECEIVED - The return log has a DB status of received.
 * - COMPLETE - The return log has a DB status of completed.
 * - VOID - The return log has a DB status of void. Cannot be submitted or received.
 *
 * @param {module:ReturnLogModel} returnLog - The return log containing status and due date information
 *
 * @returns {string} The formatted status for display.
 */
function formatReturnLogStatus(returnLog) {
  const { dueDate, endDate, status } = returnLog

  // If the return is completed we are required to display it as 'complete'. This also takes priority over the other
  // statues
  if (status === 'completed') {
    return 'complete'
  }

  // For all other statuses (received and void) except 'due' we can just return the status
  if (status !== 'due') {
    return status
  }

  const todaysDate = today()

  // If the return log has not yet ended then it is not yet due for submissions
  if (todaysDate <= endDate) {
    return 'not due yet'
  }

  // If we are here, the return log is due and has past its end date. If a due date has not been set then it is simply
  // 'open' for return submissions
  if (!dueDate) {
    return 'open'
  }

  // If we are here, the return log has a due date. If todays date is greater than that, then we are overdue
  if (dueDate < todaysDate) {
    return 'overdue'
  }

  // Calculate the start of the 'due period'. A return is considered "due" when in its 'due period'. This starts 28 days
  // before its due date (inclusive hence we use 27 in the calculation).
  const duePeriodStartDate = new Date(dueDate)

  duePeriodStartDate.setDate(duePeriodStartDate.getDate() - DUE_PERIOD_DAYS)

  if (todaysDate >= duePeriodStartDate) {
    return 'due'
  }

  // If we get here then we the return log has a status of 'due', its end date is in the past, and its due date is more
  // than 28 days in the future. Once dynamic due dates becomes the norm, we are unlikely to get to this point.
  return 'open'
}

/**
 * Format a Joi validation result into a format that can be used by our views
 *
 * If {@link https://joi.dev/ | Joi} found no validation errors the result will not contain an `error:` property.
 *
 * ```javascript
 * {
 *   value: {
 *     noticeTypes: [ 'returnReminder', 'returnInvitation' ],
 *     reference: 'RREM-VB9EFA',
 *     sentFromDay: '01',
 *     sentFromMonth: '09',
 *     sentFromYear: '2025',
 *     fromDate: 2025-09-01T00:00:00.000Z,
 *     toDate: undefined
 *   }
 * }
 * ```
 * When this is the case we return null.
 *
 * If there is an `error` property, it will contain details of error found.
 *
 * ```javascript
 * {
 *   value: {
 *     noticeTypes: [ 'returnReminder', 'returnInvitation' ],
 *     reference: 'jkdfshfhkfhsdjkfsdjkfghadshj',
 *     sentFromDay: '01',
 *     sentFromMonth: '09',
 *     fromDate: '-09-01',
 *     toDate: undefined
 *   },
 *   error: [Error [ValidationError]: Enter a valid from date. Reference must be 11 characters or less] {
 *     _original: {
 *       noticeTypes: [ 'returnReminder', 'returnInvitation' ],
 *       reference: 'jkdfshfhkfhsdjkfsdjkfghadshj',
 *       sentFromDay: '01',
 *       sentFromMonth: '09',
 *       fromDate: '-09-01',
 *       toDate: undefined
 *     },
 *     details: [
 *       {
 *         message: 'Enter a valid from date',
 *         path: [ 'fromDate' ],
 *         type: 'date.format',
 *         context: {
 *           format: [ 'YYYY-MM-DD' ],
 *           label: 'fromDate',
 *           value: '-09-01',
 *           key: 'fromDate'
 *         }
 *       },
 *       {
 *         message: 'Reference must be 11 characters or less',
 *         path: [ 'reference' ],
 *         type: 'string.max',
 *         context: {
 *           limit: 11,
 *           value: 'jkdfshfhkfhsdjkfsdjkfghadshj',
 *           encoding: undefined,
 *           label: 'reference',
 *           key: 'reference'
 *         }
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * We format the result into an 'error' object compatible with our views and `layout.njk`.
 *
 * `path` will come from the `name:` property of a component in the view, which when submitted will be translated to
 * a property on the Hapi payload received.
 *
 * We typically pass the `payload` to a **Joi** validator in the our 'submit services'. It will validate each of the
 * payloads properties, and where an error is found return it as seen in the example above.
 *
 * We can then use `path` to set the following in our formatted error.
 *
 * - a property on the `error` object against which we will assign the message to be display in the component
 * - the href to use in the error summary, to allow a user to click an error and be taken to the correct component
 *
 * ```javascript
 * {
 *   errorList: [
 *     { href: '#fromDate', text: 'Enter a valid from date' },
 *     { href: '#reference', text: 'Reference must be 11 characters or less' }
 *   ],
 *   fromDate: { text: 'Enter a valid from date' },
 *   reference: { text: 'Reference must be 11 characters or less' }
 * }
 * ```
 *
 * This is how we link back the right errors to the right components, and ensure that the error summary behaves as
 * expected.
 *
 * A single field could have multiple errors. When this is the case we want to set the first error only. This assumes
 * the validation order is correct. For example, A licence number must be valid in order to check it has any due
 * returns. Therefore, the validator should order them appropriately.
 *
 * @param {object} validationResult - the result of a Joi validation
 *
 * @returns {object|null} the formatted validation result or null if the validation result does not have an `error`
 * property
 */
function formatValidationResult(validationResult) {
  if (!validationResult.error) {
    return null
  }

  const formattedResult = {
    errorList: []
  }

  const processedFields = new Set()

  validationResult.error.details.forEach((detail) => {
    const path = detail.path[0]

    if (!processedFields.has(path)) {
      formattedResult.errorList.push({ href: `#${path}`, text: detail.message })
      formattedResult[path] = { text: detail.message }
      processedFields.add(path)
    }
  })

  return formattedResult
}

/**
 * Formats a value and unit to be displayed without a space, as per the GOV UK style guide
 *
 * For example, a value of 100 and a unit of Ml/d will be formatted as '100Ml/d'.
 *
 * @param {*} value - The value to be formatted
 * @param {*} unit - The unit to be formatted
 *
 * @returns {string} The correctly-formatted value and unit
 */
function formatValueUnit(value, unit) {
  return `${value}${unit}`
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
 * Convert a string to title case by lowercasing all characters then capitalizing the first letter of each word
 *
 * Will work for strings containing multiple words or only one.
 *
 * @param {string} value - The string to title case
 *
 * @returns {string} The title cased string
 */
function titleCase(value) {
  return (
    value
      // We convert the entire string to lower case so we can correctly convert all-caps strings like 'TEXT' to 'Text'.
      .toLowerCase()
      // replace() iterates over a string. We use it to match each word with a regex and apply a function to each match.
      // We define a word as:
      // - Starts on a word boundary (eg. a space, bracket, dash, etc.). We use \b for this.
      // - Has a word character. We use \w for this. We use + to specify there are one or more word chars.
      // This regex correctly handles converting cases like '(text)' to '(Text)'.
      .replace(/\b\w+/g, (match) => {
        // Convert the first char of the matched string to upper case and append the remainder of the string
        return match.charAt(0).toUpperCase() + match.slice(1)
      })
  )
}

module.exports = {
  convertPenceToPounds,
  formatAbstractionDate,
  formatAbstractionPeriod,
  formatChargingModuleDate,
  formatDateMonthYear,
  formatFinancialYear,
  formatLongDate,
  formatLongDateTime,
  formatMoney,
  formatNumber,
  formatPounds,
  formatPurposes,
  formatQuantity,
  formatReturnLogStatus,
  formatValidationResult,
  formatValueUnit,
  leftPadZeroes,
  sentenceCase,
  titleCase
}
