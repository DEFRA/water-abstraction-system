'use strict'

/**
 * Validates data submitted for the `/users/me/profile-details` page
 * @module ProfileDetailsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/users/me/profile-details` page
 *
 * There is no validation on this at all - there probably should be.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go(payload) {
  const schema = Joi.object().keys({
    name: Joi.string().max(100).allow('').messages({
      'string.max': 'Name must be 100 characters or less'
    }),
    jobTitle: Joi.string().max(100).allow('').messages({
      'string.max': 'Job title must be 100 characters or less'
    }),
    email: Joi.string().email().allow('').messages({
      'string.email': 'Enter a valid email'
    }),
    tel: Joi.string().max(100).allow('').messages({
      'string.max': 'Telephone number must be 100 characters or less'
    }),
    address: Joi.string().max(100).allow('').messages({
      'string.max': 'Address must be 100 characters or less'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
