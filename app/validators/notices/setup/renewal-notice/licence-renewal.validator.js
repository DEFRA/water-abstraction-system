'use strict'

/**
 * Validates the licence and that it has due returns, for the returns notice types, submitted for the `/notices/setup/{sessionId}/licence` page
 * @module LicenceRenewalValidator
 */

const Joi = require('joi')

const { licenceRefSchema } = require('../../../schemas/licence-ref.schema.js')

/**
 * Validates the licence and that it has due returns, for the returns notice types, submitted for the `/notices/setup/{sessionId}/licence` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {boolean} licenceExists - the result of checking if the licence ref is present in the database
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceExists) {
  const schema = Joi.object({
    licenceRef: licenceRefSchema(licenceExists)
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
