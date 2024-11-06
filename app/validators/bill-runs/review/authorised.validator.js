'use strict'

/**
 * Validates data submitted for the review charge reference authorised page
 * @module AuthorisedValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the review charge reference authorised page
 *
 * When editing the authorised volume on the charge reference, the user input box is pre-populated with the current
 * value. The user must overwrite this value with there own value to amend the authorised volume.
 * The validation happening here is to ensure that the volume has been entered, it has a maximum 6 decimal places and
 * is more than the totalBillableReturns.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (payload) {
  const { amendedAuthorisedVolume, totalBillableReturns } = payload

  return _validate(amendedAuthorisedVolume, Number(totalBillableReturns))
}

function _validate (amendedAuthorisedVolume, totalBillableReturns) {
  const schema = Joi
    .number()
    .min(totalBillableReturns)
    .required()
    .custom(_maxDecimals, 'Max decimals')
    .messages({
      'number.base': 'The authorised volume must be a number',
      'number.unsafe': 'The authorised volume must be a number or fewer than 17 digits long',
      'number.min': `The authorised volume must be greater than ${totalBillableReturns}`,
      'any.required': 'Enter an authorised volume',
      'any.invalid': 'The authorised volume must not have more than 6 decimal places'
    })

  return schema.validate(amendedAuthorisedVolume, { abortEarly: false })
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

module.exports = {
  go
}
