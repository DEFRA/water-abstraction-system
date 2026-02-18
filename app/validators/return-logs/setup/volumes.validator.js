'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 * @module VolumesValidator
 */

const Joi = require('joi')

const MAX_ALLOWED_VOLUME = 9999999999
const MAX_DECIMAL = 6

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object().pattern(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // Regex to match keys like '2024-04-01T00:00:00.000Z'
    Joi.number()
      .min(0)
      .max(MAX_ALLOWED_VOLUME)
      .custom(_maxDecimals, 'Max decimals')
      .messages({
        'any.invalid': 'Enter a Volume with no more than 6 decimal places',
        'number.base': 'Volume must be a number or blank',
        'number.min': 'Volume cannot be negative',
        'number.max': `Volume entered exceeds the maximum of ${MAX_ALLOWED_VOLUME}`,
        'number.unsafe': `Volume must be blank or between 0 and ${MAX_ALLOWED_VOLUME}`
      })
  )

  return schema.validate(payload, { abortEarly: false })
}

/**
 * Custom JOI validator to check a value does not have more than 6 decimal places
 *
 * Due to limitations in Joi validation for decimals, achieving validation for numbers with more than 6 decimal places
 * requires a custom approach.
 *
 * See {@link https://github.com/hapijs/joi/blob/master/API.md#anycustommethod-description | Joi custom validation}.
 *
 * @param {number} value - the value to be validated
 * @param {object} helpers - a Joi object containing a numbers of helpers
 *
 * @returns {number|object} if valid the original value else a Joi 'any.invalid' error. Knowing we return this means
 * you can assign what error message to use when a number has too many decimals.
 */
function _maxDecimals(value, helpers) {
  // Guard clause to ensure we don't try and interact with a null or undefined value
  if (!value) {
    return value
  }

  const parts = value.toString().split('.')

  if (parts.length === 1 || parts[1].length <= MAX_DECIMAL) {
    return value
  }

  return helpers.error('any.invalid')
}

module.exports = {
  go
}
