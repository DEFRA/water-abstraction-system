'use strict'

/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @module FAOValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['yes', 'no']

/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Select if you need to add an FAO'

  const schema = Joi.object({
    fao: Joi.string()
      .valid(...VALID_VALUES)
      .required()
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
