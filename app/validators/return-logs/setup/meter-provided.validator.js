'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/meter-provided` page
 * @module MeterProvidedValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['yes', 'no']

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/meter-provided` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  console.log('🚀  payload:', payload)
  const meterProvided = payload.meterProvided
  const errorMessage = 'Select if meter details have been provided'

  const schema = Joi.object({
    meterProvided: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate({ meterProvided }, { abortEarly: false })
}

module.exports = {
  go
}
