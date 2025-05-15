'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @module AlertEmailAddressValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Email address for the alert is required'

  const schema = Joi.object({
    alertEmailAddress: Joi.string().required().messages({
      'any.required': errorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
