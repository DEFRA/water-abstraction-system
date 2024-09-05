'use strict'

/**
 * Validates data submitted for the `/bill-runs/{billRunId}/review/{licenceId}/charge-reference-details/
 * {reviewChargeReferenceId}/amend-adjustment-factor` page
 * @module AdjustmentFactorValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/bill-runs/{billRunId}/review/{licenceId}/charge-reference-details/
 * {reviewChargeReferenceId}/amend-adjustment-factor` page
 *
 * When editing the aggregate factor or the charge adjustment on the charge reference, the user input boxes are
 * pre-populated with the current value for both. The user must overwrite this value with there own value to amend the
 * adjustments.
 * The validation happening here is to ensure that the adjustments have been entered. Both have a
 * minimum value of 0 and they both get validated to either 2 or 15 decimal places.
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {number} maxNumberOfDecimals - The maximum number of decimal places the factor can be validated to
 * @param {string} validationType - The type of factor being validated, this is to add to the validation messages
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (payload, maxNumberOfDecimals, validationType) {
  return _validate(payload, maxNumberOfDecimals, validationType)
}

/**
 * Due to limitations in Joi validation for decimals, achieving validation for numbers with fewer than 2 or 15 decimal
 * places requires a custom approach. First, convert the number into a string. Then split the string into an array using
 * the decimal point (`.`) as the delimiter. This results in either one item in the array (if no decimal is present) or
 * two items (if a decimal is present). The first item represents the part before the decimal, while the second item
 * represents the part after. By assessing if the length of the second string is less than 3 or 16, we can validate if
 * there the correct number of decimals.
 *
 * @private
 */
function _customValidation (quantity, helpers, maxNumberOfDecimals, validationType) {
  const quantityParts = quantity.toString().split('.')

  if (quantityParts.length === 1 || quantityParts[1].length <= maxNumberOfDecimals) {
    return quantity
  }

  return helpers.message({
    custom: `The ${validationType} factor must not have more than ${maxNumberOfDecimals} decimal places`
  })
}

function _validate (quantity, maxNumberOfDecimals, validationType) {
  const schema = Joi.object({
    quantity: Joi
      .number()
      .min(0)
      .required()
      .messages({
        'number.base': `The ${validationType} factor must be a number`,
        'number.unsafe': `The ${validationType} factor must be a number`,
        'number.min': `The ${validationType} factor must be greater than 0`,
        'any.required': `Enter a ${validationType} factor`
      })
  })

  const validation = schema.validate({ quantity }, { abortEarly: false })

  // The first check we are doing is validating that a number has been inputted. If it is a number then we can move onto
  // checking if there are a valid number of decimal places
  if (!validation.error) {
    return _validateDecimals(quantity, maxNumberOfDecimals, validationType)
  }

  return validation
}

function _validateDecimals (quantity, maxNumberOfDecimals, validationType) {
  const decimalSchema = Joi.number().custom((value, helpers) => {
    return _customValidation(value, helpers, maxNumberOfDecimals, validationType)
  })

  return decimalSchema.validate(quantity)
}

module.exports = {
  go
}
