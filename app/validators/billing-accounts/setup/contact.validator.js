/**
 * Validates data submitted for the `/billing-accounts/setup/{billingAccountId}/contact` page
 *
 * @module ContactValidator
 */

import Joi from 'joi'

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

  const schema = Joi.object({
    contactSelected: Joi.alternatives().try(Joi.string().valid('new'), Joi.string().uuid()).required().messages({
      'any.required': errorMessage,
      'any.only': errorMessage,
      'string.empty': errorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

export default {
  go
}
