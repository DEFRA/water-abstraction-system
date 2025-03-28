'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module ReadingsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object[]} lines - The lines of the return log
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, lines) {
  // Convert the payload object into an array
  const payloadEntries = Object.entries(payload).map(([endDate, reading]) => ({
    endDate,
    reading: Number(reading)
  }))

  // Use the maximum possible number if no meter reading exists in the return submission
  const maxMeterReading = _maxMeterReading(lines) || Number.MAX_SAFE_INTEGER

  const schema = Joi.object({
    startReading: Joi.number().positive().integer().max(maxMeterReading).messages({
      'number.base': 'Meter reading must be a positive number',
      'number.max': 'Please enter a reading which is equal to or lower than the next reading',
      'number.unsafe': 'Enter a reading that is 9007199254740991 or fewer',
      'number.positive': 'Reading must be a positive number',
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
