'use strict'

/**
 * Validates data submitted for the `address/{sessionId}/manual` page
 *
 * @module ManualAddressValidator
 */

const { postcodeValidator } = require('postcode-validator')
const { addressLineValidator } = require('./addressLine.validator.js')

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
    ...addressLineValidator(),
    postcode: Joi.string()
      .required()
      .custom((value, helper) => {
        if (!postcodeValidator(value, 'GB')) {
          return helper.error('string.custom')
        }
        return value
      })
      .messages({
        'any.required': 'Enter a UK postcode',
        'string.custom': 'Enter a valid UK postcode'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
