'use strict'

/**
 * Validates data submitted for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @module ContactEmailValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    email: Joi.string().max(100).email().required().messages({
      'any.required': 'Enter an email address for the contact',
      'string.email': 'Enter an email address in the correct format, like name@example.co.uk ',
      'string.max': 'Email must be 100 characters or less'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
