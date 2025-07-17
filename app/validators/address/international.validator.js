'use strict'

/**
 * Validates data submitted for the `address/{sessionId}/international` page
 *
 * @module InternationalValidator
 */

const Joi = require('joi')
const { countries } = require('../../lib/static-lookups.lib.js')
const { invalidStartCharacters } = require('../helpers/notify-address-line.validator.js')

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
    addressLine1: Joi.string().required().custom(_addressLineCustom).messages({
      'any.required': 'Enter address line 1',
      'string.custom': 'Address line 1 cannont start with a special character'
    }),
    addressLine2: Joi.string().optional().custom(_addressLineCustom).messages({
      'string.custom': 'Address line 2 cannont start with a special character'
    }),
    addressLine3: Joi.string().optional().custom(_addressLineCustom).messages({
      'string.custom': 'Address line 3 cannont start with a special character'
    }),
    addressLine4: Joi.string().optional().custom(_addressLineCustom).messages({
      'string.custom': 'Address line 4 cannont start with a special character'
    }),
    country: Joi.string()
      .required()
      .valid(...countries)
      .messages({
        'any.required': 'Select a country'
      }),
    postcode: Joi.string().optional()
  })

  return schema.validate(payload, { abortEarly: false })
}

function _addressLineCustom(value, helper) {
  if (invalidStartCharacters(value)) {
    return helper.error('string.custom')
  }
  return value
}

module.exports = {
  go
}
