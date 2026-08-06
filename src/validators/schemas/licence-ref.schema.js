/**
 * Returns a Joi schema for the `licenceRef` field
 * @module LicenceRefSchemaValidator
 */

import Joi from 'joi'

const errorMessage = 'Enter a licence number'

/**
 * Returns a Joi schema for the `licenceRef` field
 *
 * Intended for use in validators that need to validate a licence reference, with or without further chained validators.
 *
 * @param {boolean} licenceExists - the result of checking if the licence ref is present in the database
 *
 * @returns {object} A Joi schema for the `licenceRef` field
 */
export function licenceRefSchema(licenceExists) {
  return Joi.string()
    .required()
    .custom((value, helpers) => {
      return _licenceExists(value, helpers, licenceExists)
    }, 'Custom Licence Validation')
    .messages({
      invalidLicence: 'Enter a valid licence number',
      'any.required': errorMessage,
      'any.only': errorMessage,
      'string.empty': errorMessage
    })
}

function _licenceExists(value, helpers, licenceExists) {
  if (licenceExists) {
    return value
  }

  return helpers.error('invalidLicence')
}
