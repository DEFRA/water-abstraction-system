'use strict'

/**
 * @module ImportLicenceVersionPurposeValidator
 */

const Joi = require('joi')

const calender = {
  totalDaysInMonth: 31,
  totalMonthsInYear: 12
}

/**
 * Checks that imported licence version purpose data that has been transformed is valid for persisting to WRLS
 *
 * @param {object} licenceVersionPurpose - The transformed licence version purpose data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licenceVersionPurpose) {
  const schema = Joi.object({
    primaryPurposeId: Joi.string().guid().required(),
    secondaryPurposeId: Joi.string().guid().required(),
    purposeId: Joi.string().guid().required(),
    abstractionPeriodStartDay: Joi.number().integer().min(1).max(calender.totalDaysInMonth).required(),
    abstractionPeriodStartMonth: Joi.number().integer().min(1).max(calender.totalMonthsInYear).required(),
    abstractionPeriodEndDay: Joi.number().integer().min(1).max(calender.totalDaysInMonth).required(),
    abstractionPeriodEndMonth: Joi.number().integer().min(1).max(calender.totalMonthsInYear).required(),
    timeLimitedStartDate: Joi.date().iso().allow(null),
    timeLimitedEndDate: Joi.date().iso().allow(null),
    notes: Joi.string().allow(null),
    annualQuantity: Joi.number().allow(null),
    externalId: Joi.string().required(),
    instantQuantity: Joi.number().allow(null),
    hourlyQuantity: Joi.number().allow(null),
    dailyQuantity: Joi.number().allow(null)
  })

  const result = schema.validate(licenceVersionPurpose)

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
