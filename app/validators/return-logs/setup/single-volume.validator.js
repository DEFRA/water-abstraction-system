'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/single-volume` page
 * @module SingleVolumeValidator
 */

const Joi = require('joi')

const { maxDecimalPlaces } = require('../../helpers/max-decimal-places.validator.js')

const MAX_DECIMALS = 6
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
      .custom(maxDecimalPlaces(MAX_DECIMALS), 'maxDecimals')
      .messages({
        'any.required': 'Enter a total amount',
        'custom.maxDecimals': 'Enter a total amount with no more than 6 decimal places',
        'number.base': 'Enter a number for the total amount',
        'number.unsafe': 'Enter a positive total amount up to a maximum of 9007199254740991',
        'number.positive': 'Enter a total amount greater than zero'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
