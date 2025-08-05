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
    name: Joi.string().allow(''),
    jobTitle: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
    tel: Joi.string().allow(''),
    address: Joi.string().allow('')
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
