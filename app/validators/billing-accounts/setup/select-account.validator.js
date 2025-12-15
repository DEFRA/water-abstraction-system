'use strict'

/**
 * Validates data submitted for the `/billing-accounts/setup/{billingAccountId}/select-account` page
 *
 * @module SelectAccountValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['customer', 'another']

/**
 * Validates data submitted for the `/billing-accounts/setup/{billingAccountId}/select-account` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Select who should the bills go to'

  const schema = Joi.object({
    accountSelected: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
