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
  const { authorisedVolume, totalBillableReturns } = payload

  const validation = _validate(authorisedVolume, Number(totalBillableReturns))

  // The first check we are doing is validating that a number has been inputted within the correct range. If it has
  // then we can move onto next validating the number of decimal places
  if (!validation.error) {
    const decimalSchema = Joi.number().custom(_customValidation, 'custom validation')

    return decimalSchema.validate(authorisedVolume)
  }

  return validation
}

/**
 * Due to limitations in Joi validation for decimals, achieving validation for numbers with fewer than 6 decimal
 * places requires a custom approach. First, convert the number into a string. Then split the string into an array using
 * the decimal point (`.`) as the delimiter. This results in either one item in the array (if no decimal is present) or
 * two items (if a decimal is present). The first item represents the part before the decimal, while the second item
 * represents the part after. By assessing if the length of the second string is less than o equal to 6, we can validate
 * if there are the correct number of decimals.
 *
 * @private
 */
function _customValidation (quantity, helpers) {
  const maxNumberOfDecimals = 6
  const quantityParts = quantity.toString().split('.')

  if (quantityParts.length === 1 || quantityParts[1].length <= maxNumberOfDecimals) {
    return quantity
  }

  return helpers.message({
    custom: 'The authorised volume must not have more than 6 decimal places'
  })
}

function _validate (authorisedVolume, totalBillableReturns) {
  const schema = Joi.object({
    authorisedVolume: Joi
      .number()
      .min(totalBillableReturns)
      .required()
      .messages({
        'number.base': 'The authorised volume must be a number',
        'number.unsafe': 'The authorised volume must be a number or fewer than 17 digits long',
        'number.min': `The authorised volume must be greater than ${totalBillableReturns}`,
        'any.required': 'Enter an authorised volume'
      })
  })

  const validation = schema.validate({ authorisedVolume }, { abortEarly: false })

  return validation
}

module.exports = {
  go
}
