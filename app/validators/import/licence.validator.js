'use strict'

/**
 * @module ImportLicenceValidator
 */

const Joi = require('joi')

/**
 * Checks that imported licence data that has been transformed is valid for persisting to WRLS
 *
 * @param {object} licence - The transformed licence data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licence) {
  const schema = Joi.object({
    expiredDate: Joi.date().allow(null),
    lapsedDate: Joi.date().allow(null),
    licenceRef: Joi.string().required(),
    licenceVersions: Joi.array().required(),
    regionId: Joi.string().guid().required(),
    regions: Joi.object({
      regionalChargeArea: Joi.string().required(),
      localEnvironmentAgencyPlanCode: Joi.string().required(),
      historicalAreaCode: Joi.string().required(),
      standardUnitChargeCode: Joi.string().required()
    }),
    revokedDate: Joi.date().allow(null),
    startDate: Joi.date().required(),
    waterUndertaker: Joi.boolean().required()
  })

  const result = schema.validate(licence, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
