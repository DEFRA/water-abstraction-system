'use strict'

/**
 * Custom JOI validator to check a value does not have more than the specified number of decimal places
 *
 * Due to limitations in Joi validation for decimals, achieving validation for numbers with more than the specified
 * number of decimal places requires a custom approach.
 *
 * See {@link https://github.com/hapijs/joi/blob/master/API.md#anycustommethod-description | Joi custom validation}.
 *
 * @param {number} maxDecimals - the maximum number of decimal places allowed
 *
 * @returns {number|object} if valid the original value else a Joi 'custom.maxDecimals' error. Knowing we return this
 * means you can assign what error message to use when a number has too many decimals.
 */
function maxDecimalPlaces(maxDecimals) {
  return function (value, helpers) {
    if (!value) {
      return value
    }

    const parts = value.toString().split('.')

    if (parts.length === 1 || parts[1].length <= maxDecimals) {
      return value
    }

    return helpers.error('custom.maxDecimals')
  }
}
module.exports = {
  maxDecimalPlaces
}
