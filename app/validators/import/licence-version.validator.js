'use strict'

/**
 * @module ImportLicenceVersionValidator
 */

const Joi = require('joi')

const WRLS_STATUSES = ['current', 'superseded']

/**
 * Checks that imported licence version data that has been transformed is valid for persisting to WRLS
 *
 * @param {object} licenceVersion - The transformed licence version data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licenceVersion) {
  const schema = Joi.object({
    endDate: Joi.date().required().allow(null),
    externalId: Joi.string().required(),
    increment: Joi.number().required(),
    issue: Joi.number().required(),
    licenceVersionPurposes: Joi.array().required(),
    startDate: Joi.date().required(),
    status: Joi.string().required().valid(...WRLS_STATUSES)
  })

  const result = schema.validate(licenceVersion, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
