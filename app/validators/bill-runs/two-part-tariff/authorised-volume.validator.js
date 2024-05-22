'use strict'

/**
 * Validates data submitted for the `/bill-runs/{billRunId}/review/{licenceId}/charge-reference-details/
 * {reviewChargeReferenceId}/amend-authorised-volume` page
 * @module AuthorisedVolumeValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/bill-runs/{billRunId}/review/{licenceId}/charge-reference-details/
 * {reviewChargeReferenceId}/amend-authorised-volume` page
 *
 * When editing the authorised volume on the charge reference, the user input box is
 * pre-populated with the current value. The user must overwrite this value with there own value to amend the
 * authorised volume.
 * The validation happening here is to ensure that the volume have been entered, it has a maximum 6 decimal places and
 * is more than either the totalBillableReturns or the minVolume (whichever is less) and greater than the maxVolume.
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (payload) {
  const { authorisedVolume, totalBillableReturns, minVolume, maxVolume } = payload

  return _validate(authorisedVolume, totalBillableReturns, minVolume, maxVolume)
}

/**
 * Due to limitations in Joi validation for decimals, achieving validation for numbers with fewer than 6 decimal
 * places requires a custom approach. First, convert the number into a string. Then split the string into an array using
 * the decimal point (`.`) as the delimiter. This results in either one item in the array (if no decimal is present) or
 * two items (if a decimal is present). The first item represents the part before the decimal, while the second item
 * represents the part after. By assessing if the length of the second string is less than 6, we can validate if
 * there the correct number of decimals.
 */
function _customValidation (quantity, helpers) {
  const quantityParts = quantity.toString().split('.')

  if (quantityParts.length === 1 || quantityParts[1].length <= 6) {
    return quantity
  }

  return helpers.message({
    custom: 'The authorised volume must not have more than 6 decimal places'
  })
}

function _validate (authorisedVolume, totalBillableReturns, minVolume, maxVolume) {
  const minValue = Number(Math.min(totalBillableReturns, minVolume))
  const maxValue = Number(maxVolume)

  const schema = Joi.object({
    authorisedVolume: Joi
      .number()
      .min(minValue)
      .max(maxValue)
      .required()
      .messages({
        'number.base': 'The authorised volume must be a number',
        'number.unsafe': 'The authorised volume must be a number',
        'number.min': `The authorised volume must be greater than ${minValue}`,
        'number.max': `The authorised volume must be equal to or less than ${maxValue}`,
        'any.required': 'Enter a authorised volume'
      })
  })

  const validation = schema.validate({ authorisedVolume }, { abortEarly: false })

  // The first check we are doing is validating that a number has been inputted. If it is a number then we can move onto
  // checking if there are a valid number of decimal places
  if (!validation.error) {
    const decimalSchema = Joi.number().custom(_customValidation, 'custom validation')

    return decimalSchema.validate(authorisedVolume)
  }

  return validation
}

module.exports = {
  go
}
