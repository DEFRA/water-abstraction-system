'use strict'

/**
 * Validates data submitted for the `address/{sessionId}/manual` page
 *
 * @module ManualAddressValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `address/{sessionId}/manual` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    addressLine1: Joi.string().required().messages({
      'any.required': 'Enter addresss line 1'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
