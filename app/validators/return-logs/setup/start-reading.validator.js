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
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Enter a start meter reading'

  const schema = Joi.object({
    startReading: Joi.number().positive().integer().required().messages({
      'any.required': errorMessage,
      'number.base': errorMessage,
      'number.max': errorMessage,
      'number.unsafe': errorMessage,
      'number.positive': 'Start meter reading must be a positive number',
      'number.integer': errorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
