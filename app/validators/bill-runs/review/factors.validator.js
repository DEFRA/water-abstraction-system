'use strict'

/**
 * Validates data submitted for the review charge reference factors page
 * @module FactorsValidator
 */

const Joi = require('joi')

const { maxDecimalPlaces } = require('../../helpers/max-decimal-places.validator.js')

const MAX_DECIMALS = 15

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
    amendedAggregate: Joi.number().min(0).required().custom(maxDecimalPlaces(MAX_DECIMALS), 'maxDecimals').messages({
      'number.base': 'The aggregate factor must be a number',
      'number.unsafe': 'The aggregate factor must be between 0 and 9007199254740991',
      'number.min': 'The aggregate factor must be 0 or more',
      'any.required': 'Enter an aggregate factor',
      'custom.maxDecimals': 'The aggregate factor must not have more than 15 decimal places'
    }),
    amendedChargeAdjustment: Joi.number()
      .min(0)
      .required()
      .custom(maxDecimalPlaces(MAX_DECIMALS), 'maxDecimals')
      .messages({
        'number.base': 'The charge factor must be a number',
        'number.unsafe': 'The charge factor must be between 0 and 9007199254740991',
        'number.min': 'The charge factor must be 0 or more',
        'any.required': 'Enter a charge factor',
        'custom.maxDecimals': 'The charge factor must not have more than 15 decimal places'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
