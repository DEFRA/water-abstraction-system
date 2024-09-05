'use strict'

/**
 * Validates data submitted for the `/bill-runs/{billRunId}/review/{licenceId}/match-details/{reviewChargeElementId}
 * /amend-billable-returns` page
 * @module BillableReturnsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/bill-runs/{billRunId}/review/{licenceId}/match-details/{reviewChargeElementId}
 * /amend-billable-returns` page
 *
 * When editing the charge elements billable volume the user must either choose the existing authorised volume or enter
 * there own custom volume. The validation happening here is to ensure that a user selects either option and if its the
 * custom one, that they enter a number above 0 but below the authorised volume and that the number is less than 6
 * decimal places.
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (payload) {
  const { 'quantity-options': selectedOption } = payload

  if (selectedOption === 'customQuantity') {
    return _validateCustomQuantity(payload.customQuantity, Number(payload.authorisedVolume))
  }

  return _validateAuthorisedQuantity(selectedOption)
}

/**
 * Due to limitations in Joi validation for decimals, achieving validation for numbers with fewer than 6 decimal places
 * requires a custom approach. First, convert the number into a string. Then split the string into an array using the
 * decimal point (`.`) as the delimiter. This results in either one item in the array (if no decimal is present) or two
 * items (if a decimal is present). The first item represents the part before the decimal, while the second item
 * represents the part after. By assessing if the length of the second string is less than 7, we can validate if there
 * the correct number of decimals.
 *
 * @private
 */
function customValidation (customQuantity, helpers) {
  const maxNumberOfDecimals = 7
  const customQuantityParts = customQuantity.toString().split('.')

  if (customQuantityParts.length === 1 || customQuantityParts[1].length < maxNumberOfDecimals) {
    return customQuantity
  }

  return helpers.message({ custom: 'The quantity must contain no more than 6 decimal places' })
}

function _validateCustomQuantity (customQuantity, authorisedVolume) {
  const schema = Joi.object({
    customQuantity: Joi
      .number()
      .min(0)
      .max(authorisedVolume)
      .required()
      .messages({
        'number.unsafe': 'The quantity must be a number',
        'number.base': 'The quantity must be a number',
        'number.min': 'The quantity must be zero or higher',
        'number.max': 'The quantity must be the same as or less than the authorised amount',
        'any.required': 'Enter the billable quantity'
      })
  })

  const validation = schema.validate({ customQuantity }, { abortEarly: true })

  // The first check we are doing is validating that a number has been inputted. If it has then we can move onto our
  // next check for if there are less than 7 decimal places.
  if (!validation.error) {
    const decimalSchema = Joi.number().custom(customValidation, 'custom validation')

    return decimalSchema.validate(customQuantity)
  }

  return validation
}

function _validateAuthorisedQuantity (selectedOption) {
  const schema = Joi.object({
    selectedOption: Joi
      .number()
      .required()
      .messages({
        'any.required': 'Select the billable quantity'
      })
  })

  return schema.validate({ selectedOption }, { abortEarly: true })
}

module.exports = {
  go
}
