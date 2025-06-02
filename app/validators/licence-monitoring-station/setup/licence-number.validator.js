'use strict'

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @module LicenceNumberValidator
 */

const Joi = require('joi')

const ENTER_A_LICENCE_NUMBER_ERROR = 'Enter a licence number'

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {boolean} licenceExists - the result of checking if the licence ref is present in the database
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceExists) {
  const schema = Joi.object({
    licenceRef: Joi.string()
      .required()
      .custom((value, helpers) => {
        return _licenceExists(value, helpers, licenceExists)
      }, 'Custom Licence Validation')
      .messages({
        invalidLicence: 'Enter a valid licence number',
        'any.required': ENTER_A_LICENCE_NUMBER_ERROR,
        'any.only': ENTER_A_LICENCE_NUMBER_ERROR,
        'string.empty': ENTER_A_LICENCE_NUMBER_ERROR
      })
  })

  return schema.validate(payload, { abortEarly: false })
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
