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
  const maxAllowedReading = 99999999999

  // Use the `maxAllowedReading` if no meter reading exists in the return submission
  const maxMeterReading = _maxMeterReading(lines) || maxAllowedReading

  const maxValidationMessage = _maxValidationMessage(maxAllowedReading, maxMeterReading)

  const schema = Joi.object({
    startReading: Joi.number()
      .positive()
      .integer()
      .required()
      .max(maxMeterReading)
      .messages({
        'any.required': 'Enter a start meter reading',
        'number.base': 'Start meter reading must be a positive number',
        'number.max': maxValidationMessage,
        'number.unsafe': `Start meter reading exceeds the maximum of ${maxAllowedReading}`,
        'number.positive': 'Start meter reading must be a positive number',
        'number.integer': 'Start meter reading must be a whole number'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

/**
 * Generates the validation message for when the start reading is greater than the maximum allowed. The message differs
 * depending on if the maximum reading is a reading taken from the submission lines or the `maxAllowedReading`
 *
 * @private
 */
function _maxValidationMessage(maxAllowedReading, maxMeterReading) {
  if (maxAllowedReading === maxMeterReading) {
    return `Start meter reading exceeds the maximum of ${maxAllowedReading}`
  }

  return `Please enter a reading which is equal to or lower than the next reading of ${maxMeterReading}`
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
