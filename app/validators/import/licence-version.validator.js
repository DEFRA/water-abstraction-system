'use strict'

/**
 * @module ImportLicenceVersionValidator
 */

const Joi = require('joi')

const statuses = ['current', 'superseded']

/**
 * Checks that imported licence version data that has been transformed is valid for persisting to WRLS
 *
 * @param {object} licenceVersion - The transformed licence version data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licenceVersion) {
  const schema = Joi.object({
    endDate: Joi.date().iso().required().allow(null),
    externalId: Joi.string().required(),
    increment: Joi.number().required(),
    issue: Joi.number().required(),
    startDate: Joi.date().iso().required(),
    status: Joi.string().required().valid(...statuses)
  })

  const result = schema.validate(licenceVersion)

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
