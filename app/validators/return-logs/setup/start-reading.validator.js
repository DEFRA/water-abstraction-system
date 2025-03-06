'use strict'

/**
 * Validates data submitted for the `/return-logs/{sessionId}/start-reading` page
 * @module StartReadingValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/{sessionId}/start-reading` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object[]} lines - The lines of the return log
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, lines) {
  console.log('🚀 lines:', lines)
  console.log('🚀 payload:', payload)
  // Use the maximum possible number if no meter reading exists in the return submission
  const maxMeterReading = _maxMeterReading(lines) || Number.MAX_SAFE_INTEGER

  const schema = Joi.object({
    startReading: Joi.number().positive().integer().required().max(maxMeterReading).messages({
      'any.required': 'Enter a start meter reading',
      'number.base': 'Start meter reading must be a positive number',
      'number.max': 'Please enter a reading which is equal to or lower than the next reading',
      'number.unsafe': 'Enter a reading that is 9007199254740991 or fewer',
      'number.positive': 'Start meter reading must be a positive number',
      'number.integer': 'Enter a whole number'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

/**
 * Finds the first line with a reading and returns that reading as a number or undefined
 *
 * @private
 */
function _maxMeterReading(lines) {
  const firstLine = lines.find((line) => {
    return line.reading
  })

  return Number(firstLine?.reading)
}

module.exports = {
  go
}

// REBECCA
// Tidy up console logs
// Validation error messages for the max number
// Fix the unit tests for the routes that you have broken
// Make sure in the controller to test the new way the pages can redirect
// Need to test the check answers page stuff that has been added to the page
