'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/single-volume` page
 * @module SingleVolumeValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['yes', 'no']

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/single-volume` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const singleVolumeError = "Select if it's a single volume"

  const schema = Joi.object({
    singleVolume: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': singleVolumeError,
        'any.only': singleVolumeError,
        'string.empty': singleVolumeError
      }),
    singleVolumeQuantity: Joi.number()
      .positive()
      .when('singleVolume', { is: 'yes', then: Joi.required() })
      .custom(_maxDecimals, 'Max decimals')
      .messages({
        'any.invalid': 'Enter a number with no more than 6 decimal places',
        'any.required': 'Enter a total figure',
        'number.base': 'Enter a total figure',
        'number.unsafe': 'Enter a smaller total figure',
        'number.positive': 'Enter a total figure greater than zero'
      })
  })

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

  if (parts.length === 1 || parts[1].length <= 6) {
    return value
  }

  return helpers.error('any.invalid')
}

module.exports = {
  go
}
