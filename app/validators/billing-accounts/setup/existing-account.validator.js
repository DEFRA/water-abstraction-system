'use strict'

/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @module ExistingAccountValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/existing-account` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Select does this account already exist?'

  const schema = Joi.object({
    existingAccount: Joi.alternatives().try(Joi.string().valid('new'), Joi.string().uuid()).required().messages({
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
