'use strict'

/**
 * Validates data submitted for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @module AccountTypeValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['company', 'individual']
const MAX_LENGTH = 100

/**
 * Validates data submitted for the `/billing-accounts/setup/{billingAccountId}/account-type` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Select the account type'
  const inpputErrorMessage = 'Enter the full name of the individual.'

  const schema = Joi.object({
    accountType: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      }),
    searchIndividualInput: Joi.alternatives().conditional('accountType', {
      is: 'individual',
      then: Joi.string()
        .trim()
        .required()
        .max(MAX_LENGTH)
        .messages({
          'any.required': inpputErrorMessage,
          'string.base': inpputErrorMessage,
          'string.empty': inpputErrorMessage,
          'string.max': `Search query must be ${MAX_LENGTH} characters or less`
        }),
      otherwise: Joi.string().optional()
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
