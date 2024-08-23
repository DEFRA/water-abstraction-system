'use strict'

/**
 * @module CustomDateValidator
 */

/**
 * Validates a string is in the format yyyy-mm-dd
 *
 * @returns {string} - returns the string value if the date is a valid ISO date YYYY-MM-DD
 * @throws {Error} - throws an error if the date is not in the correct format or is not a valid date
 */
const isValidISODate = (value) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/

  if (!regex.test(value)) {
    throw new Error('date must be in the format YYYY-MM-DD')
  }

  const [, month, day] = value.split('-')

  const maxMonths = 12
  const maxDays = 31

  // Basic check for valid month and day values (can be extended for more robust validation)
  if (month < 1 || month > maxMonths || day < 1 || day > maxDays) {
    throw new Error('date must be a valid date')
  }

  return value
}

module.exports = {
  isValidISODate
}
