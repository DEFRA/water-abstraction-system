'use strict'

/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @module SelectExistingAddressValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['existing', 'new']

/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {string} name - The name of the existing customer contact
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, name) {
  const errorMessage = `Select an existing address for ${name}`

  const schema = Joi.object({
    addressSelected: Joi.string()
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
