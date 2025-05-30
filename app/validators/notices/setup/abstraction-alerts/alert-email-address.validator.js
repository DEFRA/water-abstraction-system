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
  const VALID_VALUES = ['username', 'other']

  const schema = Joi.object({
    alertEmailAddress: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Enter an email address'
      }),
    otherUser: Joi.alternatives().conditional('alertEmailAddress', {
      is: 'other',
      then: Joi.string().email().required().messages({
        'string.email': 'Enter an email address in the correct format, like name@example.com',
        'any.required': 'Enter an email address'
      }),
      otherwise: Joi.forbidden()
    })
  })
  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
