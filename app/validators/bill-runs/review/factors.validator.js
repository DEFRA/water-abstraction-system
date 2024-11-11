'use strict'

/**
 * Validates data submitted for the review charge reference factors page
 * @module FactorsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the review charge reference factors page
 *
 * There are two inputs on the page, both of which need to contain valid values. However, they are always pre-populated
 * with existing data, so in theory would only both be invalid if the user has incorrectly updated both.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go(payload) {
  const schema = Joi.object({
    amendedAggregate: Joi.number().min(0).required().custom(_maxDecimals, 'Max decimals').messages({
      'number.base': 'The aggregate factor must be a number',
      'number.unsafe': 'The aggregate factor must be a number',
      'number.min': 'The aggregate factor must be greater than 0',
      'any.required': 'Enter an aggregate factor',
      'any.invalid': 'The aggregate factor must not have more than 15 decimal places'
    }),
    amendedChargeAdjustment: Joi.number().min(0).required().custom(_maxDecimals, 'Max decimals').messages({
      'number.base': 'The charge factor must be a number',
      'number.unsafe': 'The charge factor must be a number',
      'number.min': 'The charge factor must be greater than 0',
      'any.required': 'Enter a charge factor',
      'any.invalid': 'The charge factor must not have more than 15 decimal places'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

/**
 * Custom JOI validator to check a value does not have more than 15 decimal places
 *
 * We are limited to 15 decimals by the Rules Service that will eventually be called to calculate the charge. Due to
 * limitations in Joi validation for decimals, achieving validation for numbers with more than 15 decimal places
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

  if (parts.length === 1 || parts[1].length <= 15) {
    return value
  }

  return helpers.error('any.invalid')
}

module.exports = {
  go
}
