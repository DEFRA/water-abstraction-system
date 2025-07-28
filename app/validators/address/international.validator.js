'use strict'

/**
 * Validates data submitted for the `address/{sessionId}/international` page
 *
 * @module InternationalValidator
 */

const Joi = require('joi')
const { countries } = require('../../lib/static-lookups.lib.js')
const { addressLineValidator } = require('./addressLine.validator.js')

/**
 * Validates data submitted for the `address/{sessionId}/international` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    ...addressLineValidator(),
    country: Joi.string()
      .required()
      .valid(...countries)
      .messages({
        'any.required': 'Select a country',
        'any.only': 'Select a country'
      }),
    postcode: Joi.string().optional()
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
