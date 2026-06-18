'use strict'

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @module LicenceNumberValidator
 */

const Joi = require('joi')

const { isFalse } = require('../../helpers/is-false.validator.js')

const ENTER_A_LICENCE_NUMBER_ERROR = 'Enter a licence number'

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object|null} licence - the licence if it exists
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licence) {
  const licenceExists = !!licence
  const licenceHasEnded = licence?.$ended() ?? false

  const schema = Joi.object({
    licenceRef: Joi.string()
      .required()
      .custom(isFalse(!licenceExists, 'invalidLicence'))
      .custom(isFalse(licenceHasEnded, 'licenceEnded'))
      .messages({
        invalidLicence: 'Licence could not be found',
        licenceEnded: 'The licence has ended',
        'any.required': ENTER_A_LICENCE_NUMBER_ERROR,
        'any.only': ENTER_A_LICENCE_NUMBER_ERROR,
        'string.empty': ENTER_A_LICENCE_NUMBER_ERROR
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
