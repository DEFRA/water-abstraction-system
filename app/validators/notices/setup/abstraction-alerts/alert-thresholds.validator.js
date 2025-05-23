'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @module AlertThresholdsValidator
 */

const Joi = require('joi')

const ERROR_MESSAGE = 'Select applicable threshold(s)'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    'alert-thresholds': Joi.array().items(Joi.string()).required().messages({
      'any.required': ERROR_MESSAGE,
      'array.base': ERROR_MESSAGE,
      'array.sparse': ERROR_MESSAGE,
      'string.base': ERROR_MESSAGE
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
