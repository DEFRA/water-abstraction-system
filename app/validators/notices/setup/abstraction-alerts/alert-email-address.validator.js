'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @module AlertEmailAddressValidator
 */

const Joi = require('joi')

const ERROR_MESSAGES = {
  invalidEmail: 'Enter an email address in the correct format, like name@example.com',
  selectOrEmpty: 'Enter an email address'
}
const VALID_VALUES = ['username', 'other']

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/abstraction-alerts/alert-email-address` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    alertEmailAddress: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .label('alertEmailAddress')
      .messages({
        'any.required': ERROR_MESSAGES.selectOrEmpty
      }),
    otherUser: Joi.alternatives().conditional('alertEmailAddress', {
      is: 'other',
      then: Joi.string().email().empty('').required().label('otherUser').messages({
        'string.email': ERROR_MESSAGES.invalidEmail,
        'string.empty': ERROR_MESSAGES.selectOrEmpty,
        'any.required': ERROR_MESSAGES.selectOrEmpty
      }),
      otherwise: Joi.forbidden()
    })
  })
  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
