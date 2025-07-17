'use strict'

const Joi = require('joi')

const { invalidStartCharacters } = require('../helpers/notify-address-line.validator.js')

/**
 * A Joi schema for validating address lines.
 *
 * @function addressLineValidator
 *
 * @param {string} value - The value to be validated.
 *
 * @returns {object} A Joi schema object.
 */
function addressLineValidator() {
  return {
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
    })
  }
}

function _addressLineCustom(value, helper) {
  if (invalidStartCharacters(value)) {
    return helper.error('string.custom')
  }
  return value
}

module.exports = {
  addressLineValidator
}
