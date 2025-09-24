'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/units` page
 * @module UnitsValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['cubicMetres', 'litres', 'megalitres', 'gallons']

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/units` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const units = payload.units

  const errorMessage = 'Select which units were used'

  const schema = Joi.object({
    units: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate({ units }, { abortEarly: false })
}

module.exports = {
  go
}
