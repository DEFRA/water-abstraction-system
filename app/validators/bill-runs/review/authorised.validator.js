'use strict'

/**
 * Validates data submitted for the review charge reference authorised page
 * @module AuthorisedValidator
 */

const Joi = require('joi')

const { maxDecimalPlaces } = require('../../helpers/max-decimal-places.validator.js')

const MAX_DECIMALS = 6

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
function go(payload) {
  const { amendedAuthorisedVolume, totalBillableReturns } = payload

  return _validate(amendedAuthorisedVolume, Number(totalBillableReturns))
}

function _validate(amendedAuthorisedVolume, totalBillableReturns) {
  const schema = Joi.number()
    .min(totalBillableReturns)
    .required()
    .custom(maxDecimalPlaces(MAX_DECIMALS), 'maxDecimals')
    .messages({
      'number.base': 'The authorised volume must be a number',
      'number.unsafe': 'The authorised volume must be a number or fewer than 17 digits long',
      'number.min': `The authorised volume must be greater than ${totalBillableReturns}`,
      'any.required': 'Enter an authorised volume',
      'custom.maxDecimals': 'The authorised volume must not have more than 6 decimal places'
    })

  return schema.validate(amendedAuthorisedVolume, { abortEarly: false })
}

module.exports = {
  go
}
