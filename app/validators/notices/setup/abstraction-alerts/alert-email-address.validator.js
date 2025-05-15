'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alert/alert-email-address` page
 *
 * @module AlertEmailAddressValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alert/alert-email-address` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Email address for the alert is required'

  const schema = Joi.object({
    alertEmailAddress: Joi.string().required().valid('saved-email-address', 'other-email-address').messages({
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
