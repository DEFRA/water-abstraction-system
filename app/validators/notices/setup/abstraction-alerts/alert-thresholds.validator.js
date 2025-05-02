'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @module AlertThresholdsValidator
 */

const Joi = require('joi')

const errorMessage = 'Select applicable threshold(s)'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    'alert-thresholds': Joi.alternatives().try(Joi.string(), Joi.array()).required().messages({
      'any.required': errorMessage,
      'alternatives.types': errorMessage,
      'string.base': errorMessage,
      'array.base': errorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
