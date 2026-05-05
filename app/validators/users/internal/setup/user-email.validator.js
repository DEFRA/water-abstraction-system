'use strict'

/**
 * Validates data submitted for the '/users/internal/setup/{sessionId}/user-email' page
 *
 * @module UserEmailValidator
 */

const Joi = require('joi')

const { isFalse } = require('../../../helpers/is-false.validator.js')

/**
 * Validates data submitted for the '/users/internal/setup/{sessionId}/user-email' page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {boolean} emailExists - Indicates if the email already exists in the system
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, emailExists) {
  const schema = Joi.object({
    email: Joi.string()
      .max(100)
      .email()
      // Checks the email address ends with gov.uk and allows for capitalisation of the domain (e.g. GOV.UK or Gov.Uk)
      .pattern(/gov\.uk$/i)
      .required()
      .custom(isFalse(emailExists))
      .messages({
        'any.required': 'Enter an email address for this user',
        'custom.isFalse': 'Enter a different email address than one that already exists',
        'string.email': 'Enter an email address in the correct format, like name@environment-agency.gov.uk',
        'string.max': 'Email must be 100 characters or less',
        'string.pattern.base': 'Enter a gov.uk email address, like name@environment-agency.gov.uk'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
