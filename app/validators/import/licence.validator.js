'use strict'

/**
 * @module ImportLicenceValidator
 */

const Joi = require('joi')

/**
 * Checks that the data for inserting/updating the public.licence table is valid
 *
 * @param {ImportLicenceType} data The data to be validated
 *
 * Throws an error if anything fails
 *
 */
function go (data) {
  const result = _schema.validate(data)

  if (Object.hasOwn(result, 'error')) {
    throw new Error(result.error.details[0].message)
  }
}

const _schema = Joi.object({
  expiredDate: Joi.date().iso().allow(null),
  lapsedDate: Joi.date().iso().allow(null),
  licenceRef: Joi.string().required(),
  naldRegionId: Joi.number().required(),
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

module.exports = {
  go
}
