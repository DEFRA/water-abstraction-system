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
function go(licence) {
  const schema = Joi.object({
    expiredDate: Joi.date().allow(null),
    lapsedDate: Joi.date().allow(null),
    // NOTE: With the combination of trim() and `convert: false` passed to validate() we ensure that the licence ref
    // does not contain any leading or trailing whitespace. It is common for users to accidentally add whitespace in
    // NALD.Because of this when the legacy import runs it sees the licence as distinct and so creates a new record.
    // This then breaks the service because things like search, find the errant licence record and 'blow up' because the
    // licence ref doesn't match validation held in a different part of the service.
    // We don't want to make the same mistake with our version.
    licenceRef: Joi.string().trim().required(),
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
