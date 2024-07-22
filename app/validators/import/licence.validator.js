'use strict'

/**
 * @module ImportLicenceValidator
 */

const Joi = require('joi')

const CustomDateValidator = require('../custom/date.validators.js')

/**
 * Checks that the data for inserting/updating the public.licence table is valid
 *
 * @param {ImportLicenceType} data The data to be validated
 *
 * Throws an error if anything fails
 *
 */
function go (data) {
  const schema = Joi.object({
    expiredDate: Joi.string().allow(null).custom(CustomDateValidator.isValidISODate),
    lapsedDate: Joi.string().allow(null).custom(CustomDateValidator.isValidISODate),
    licenceRef: Joi.string().required(),
    naldRegionId: Joi.number().required(),
    regions: Joi.object({
      regionalChargeArea: Joi.string(),
      localEnvironmentAgencyPlanCode: Joi.string(),
      historicalAreaCode: Joi.string(),
      standardUnitChargeCode: Joi.string()
    }),
    revokedDate: Joi.string().allow(null).custom(CustomDateValidator.isValidISODate),
    startDate: Joi.string().required().custom(CustomDateValidator.isValidISODate),
    waterUndertaker: Joi.boolean().required()
  })

  const result = schema.validate(data)

  if (Object.hasOwn(result, 'error')) {
    throw new Error(result.error.details[0].message)
  }
}

module.exports = {
  go
}
