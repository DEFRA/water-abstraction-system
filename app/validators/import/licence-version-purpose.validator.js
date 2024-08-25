'use strict'

/**
 * @module ImportLicenceVersionPurposeValidator
 */

const Joi = require('joi')

const CALENDAR = {
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
    abstractionPeriodEndDay: Joi.number().integer().min(1).max(CALENDAR.totalDaysInMonth).required(),
    abstractionPeriodEndMonth: Joi.number().integer().min(1).max(CALENDAR.totalMonthsInYear).required(),
    abstractionPeriodStartDay: Joi.number().integer().min(1).max(CALENDAR.totalDaysInMonth).required(),
    abstractionPeriodStartMonth: Joi.number().integer().min(1).max(CALENDAR.totalMonthsInYear).required(),
    annualQuantity: Joi.number().allow(null),
    dailyQuantity: Joi.number().allow(null),
    externalId: Joi.string().required(),
    hourlyQuantity: Joi.number().allow(null),
    instantQuantity: Joi.number().allow(null),
    notes: Joi.string().allow(null),
    primaryPurposeId: Joi.string().guid().required(),
    purposeId: Joi.string().guid().required(),
    secondaryPurposeId: Joi.string().guid().required(),
    timeLimitedEndDate: Joi.date().allow(null),
    timeLimitedStartDate: Joi.date().allow(null)
  })

  const result = schema.validate(licenceVersionPurpose, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
