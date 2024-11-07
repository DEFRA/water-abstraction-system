'use strict'

/**
 * Validates data submitted for the review charge element edit page
 * @module EditValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the review charge element edit page
 *
 * When editing the charge element's billable volume the user must either choose the existing authorised volume or enter
 * there own custom volume. The validation happening here is to ensure that a user selects either option and if its the
 * custom one, that they enter a number above 0 but below the authorised volume and that the number is less than 6
 * decimal places.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (payload) {
  const { quantityOptions } = payload

  if (quantityOptions === 'customQuantity') {
    return _validateCustomQuantity(payload.customQuantity, Number(payload.authorisedVolume))
  }

  return _validateAuthorisedQuantity(quantityOptions)
}

/**
 * Custom JOI validator to check a value does not have more than 6 decimal places
 *
 * We are limited to 6 decimals by the Rules Service that will eventually be called to calculate the charge. Due to
 * limitations in Joi validation for decimals, achieving validation for numbers with more than 6 decimal places
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
function _maxDecimals (value, helpers) {
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

function _validateCustomQuantity (customQuantity, authorisedVolume) {
  const schema = Joi
    .number()
    .min(0)
    .max(authorisedVolume)
    .custom(_maxDecimals, 'Max decimals')
    .required()
    .messages({
      'number.unsafe': 'The quantity must be a number',
      'number.base': 'The quantity must be a number',
      'number.min': 'The quantity must be zero or higher',
      'number.max': 'The quantity must be the same as or less than the authorised amount',
      'any.required': 'Enter the billable quantity',
      'any.invalid': 'The quantity must contain no more than 6 decimal places'
    })

  return schema.validate(customQuantity, { abortEarly: true })
}

function _validateAuthorisedQuantity (quantityOptions) {
  const schema = Joi
    .number()
    .required()
    .messages({
      'any.required': 'Select the billable quantity'
    })

  return schema.validate(quantityOptions, { abortEarly: true })
}

module.exports = {
  go
}
