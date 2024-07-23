'use strict'

/**
 * @module ImportLicenceVersionsValidator
 */

const Joi = require('joi')

/**
 * Checks that the data for inserting/updating the public.licence_versions
 * and public.licence_versions_purposes table is valid
 *
 * @param {ImportLicenceVersionType[]} data The data to be validated
 *
 * Throws an error if anything fails
 *
 */
function go (data) {
  const purposeSchema = Joi.object({
    primaryPurposeId: Joi.string().required(),
    secondaryPurposeId: Joi.string().required(),
    purposeId: Joi.string().required(),
    abstractionPeriodStartDay: Joi.number().integer().min(1).max(31).required(),
    abstractionPeriodStartMonth: Joi.number().integer().min(1).max(12).required(),
    abstractionPeriodEndDay: Joi.number().integer().min(1).max(31).required(),
    abstractionPeriodEndMonth: Joi.number().integer().min(1).max(12).required(),
    timeLimitedStartDate: Joi.date().iso().allow(null),
    timeLimitedEndDate: Joi.date().iso().allow(null),
    notes: Joi.string().allow(null),
    annualQuantity: Joi.number().allow(null),
    externalId: Joi.string().required(),
    instantQuantity: Joi.number().allow(null),
    hourlyQuantity: Joi.number().allow(null),
    dailyQuantity: Joi.number().allow(null)
  })

  const schema = Joi.array().items({
    endDate: Joi.date().iso().required().allow(null),
    externalId: Joi.string().required(),
    increment: Joi.number().required(),
    issue: Joi.number().required(),
    startDate: Joi.date().iso().required().allow(null),
    status: Joi.string().required(),
    purposes: Joi.array().items(purposeSchema).required()
  })

  const result = schema.validate(data)

  if (Object.hasOwn(result, 'error')) {
    throw new Error(result.error.details[0].message)
  }
}

module.exports = {
  go
}
