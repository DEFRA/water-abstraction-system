'use strict'

/**
 * Validates data submitted for the `/notices/setup/licence` page
 * @module AdHocLicenceValidator
 */

const Joi = require('joi')

const errorMessage = 'Enter a licence number'

/**
 * Validates data submitted for the `/notices/setup/licence` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {boolean} licenceExists - the result of checking if the licence ref is present in the database
 * @param {boolean} dueReturns - the result of checking if the licence has due returns present in the database
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceExists, dueReturns) {
  const schema = Joi.object({
    licenceRef: Joi.string()
      .required()
      .custom((value, helpers) => {
        return _licenceExists(value, helpers, licenceExists)
      }, 'Custom Licence Validation')
      .custom((value, helpers) => {
        return _dueReturns(value, helpers, dueReturns)
      }, 'Custom Licence due returns Validation')
      .messages({
        invalidLicence: 'Enter a valid licence number',
        dueReturns: 'There are no returns due for licence {{#licenceRef}}',
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

function _dueReturns(value, helpers, dueReturns) {
  if (dueReturns) {
    return value
  }

  return helpers.error('dueReturns', { licenceRef: value })
}

function _licenceExists(value, helpers, licenceExists) {
  if (licenceExists) {
    return value
  }

  return helpers.error('invalidLicence')
}

module.exports = {
  go
}
