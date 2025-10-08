'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/contact-type` page
 *
 * @module ContactTypeValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/contact-type` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    contactType: Joi.string().required().messages({
      'any.required': 'Select how to contact the recipient'
    }),
    contactEmail: Joi.alternatives().conditional('contactType', {
      is: 'email',
      then: Joi.string().email().required().messages({
        'string.email': 'Enter an email address in the correct format, like name@example.com',
        'any.required': 'Enter an email address'
      }),
      otherwise: Joi.string().optional()
    }),
    contactName: Joi.alternatives().conditional('contactType', {
      is: 'post',
      then: Joi.string().required().messages({
        'any.required': 'Enter the recipients name'
      }),
      otherwise: Joi.string().optional()
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
