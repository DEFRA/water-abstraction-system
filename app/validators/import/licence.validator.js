'use strict'

/**
 * @module ImportLicenceValidator
 */

const Joi = require('joi')

/**
 * Checks that imported licence data that has been transformed is valid for persisting to WRLS
 *
 * A valid licence structure is the following. Some properties must contain at least one child object to be valid. Those
 * that are optional we leave empty.
 *
 * ```javascript
 * {
 *   licenceVersions: [{
 *     licenceVersionPurposes: [{
 *       licenceVersionPurposeConditions: []
 *     }]
 *   }]
 * }
 * ```
 *
 * @param {object} licence - The transformed licence data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licence) {
  const schema = Joi.object({
    expiredDate: Joi.date().iso().allow(null),
    lapsedDate: Joi.date().iso().allow(null),
    licenceRef: Joi.string().required(),
    licenceVersions: Joi.array().required(),
    regionId: Joi.string().guid().required(),
    regions: Joi.object({
      regionalChargeArea: Joi.string().required(),
      localEnvironmentAgencyPlanCode: Joi.string().required(),
      historicalAreaCode: Joi.string().required(),
      standardUnitChargeCode: Joi.string().required()
    }),
    revokedDate: Joi.date().iso().allow(null),
    startDate: Joi.date().iso().required(),
    waterUndertaker: Joi.boolean().required()
  })

  const result = schema.validate(licence)

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
