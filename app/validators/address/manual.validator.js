'use strict'

/**
 * Validates data submitted for the `address/{sessionId}/manual` page
 *
 * @module ManualAddressValidator
 */

const { postcodeValidator } = require('postcode-validator')

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
    addressLine1: Joi.string()
      .required()
      .custom((value, helper) => {
        if (_invalidStartCharacters(value)) {
          return helper.error('string.custom')
        }
        return value
      })
      .messages({
        'any.required': 'Enter address line 1',
        'string.custom': 'Address line 1 cannont start with a special character'
      }),
    addressLine2: Joi.string()
      .optional()
      .custom((value, helper) => {
        if (_invalidStartCharacters(value)) {
          return helper.error('string.custom')
        }
        return value
      })
      .messages({
        'string.custom': 'Address line 2 cannont start with a special character'
      }),
    addressLine3: Joi.string()
      .optional()
      .custom((value, helper) => {
        if (_invalidStartCharacters(value)) {
          return helper.error('string.custom')
        }
        return value
      })
      .messages({
        'string.custom': 'Address line 3 cannont start with a special character'
      }),
    addressLine4: Joi.string()
      .optional()
      .custom((value, helper) => {
        if (_invalidStartCharacters(value)) {
          return helper.error('string.custom')
        }
        return value
      })
      .messages({
        'string.custom': 'Address line 4 cannont start with a special character'
      }),
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

function _invalidStartCharacters(value) {
  const startCharacters = ['@', '(', ')', '=', '[', ']', '”', '\\', '/', '<', '>']

  return startCharacters.some((character) => {
    return value.startsWith(character)
  })
}

module.exports = {
  go
}
