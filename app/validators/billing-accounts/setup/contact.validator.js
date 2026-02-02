'use strict'

/**
 * Validates data submitted for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module ContactValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['person', 'department']
const MAX_LENGTH = 100

/**
 * Validates data submitted for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Select a contact'
  const inpputErrorMessage = 'Department name cannot be blank'

  const schema = Joi.object({
    contactSelected: Joi.alternatives()
      .try(Joi.string().valid(...VALID_VALUES), Joi.string().uuid())
      .required()
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      }),
    departmentName: Joi.alternatives().conditional('contactSelected', {
      is: 'department',
      then: Joi.string()
        .trim()
        .required()
        .max(MAX_LENGTH)
        .messages({
          'any.required': inpputErrorMessage,
          'string.base': inpputErrorMessage,
          'string.empty': inpputErrorMessage,
          'string.max': `Department name must be ${MAX_LENGTH} characters or less`
        }),
      otherwise: Joi.string().optional()
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
