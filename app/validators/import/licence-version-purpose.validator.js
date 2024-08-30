'use strict'

/**
 * @module ImportLicenceVersionPurposeValidator
 */

const Joi = require('joi')

const MONTHS_IN_YEAR = 12

/**
 * Checks that imported licence version purpose data that has been transformed is valid for persisting to WRLS
 *
 * @param {object} licenceVersionPurpose - The transformed licence version purpose data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licenceVersionPurpose) {
  const schema = Joi.object({
    abstractionPeriodEndDay: _daysInMonthSchema('abstractionPeriodEndMonth'),
    abstractionPeriodEndMonth: Joi.number().integer().min(1).max(MONTHS_IN_YEAR).required(),
    abstractionPeriodStartDay: _daysInMonthSchema('abstractionPeriodStartMonth'),
    abstractionPeriodStartMonth: Joi.number().integer().min(1).max(MONTHS_IN_YEAR).required(),
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
    timeLimitedStartDate: Joi.date().allow(null),
    licenceVersionPurposeConditions: Joi.array()
  })

  const result = schema.validate(licenceVersionPurpose, { convert: false })

  if (result.error) {
    throw result.error
  }
}

/**
 * Allows us to validate that the abstraction period is valid, for example, it is not April 31 or June 31 (those months
 * only have 30 days).
 *
 * Also, we have encountered issues previously where users have entered the end abstraction period as 29 Feb because it
 * was a leap year at the time of creation. However, when this data is used in a non-leap year, for example, billing
 * it causes the service to error.
 *
 * It is agreed by the team that administer WRLS that only 28 Feb will ever be used, regardless of leap year.
 *
 * @private
 */
function _daysInMonthSchema (endMonthProperty) {
  return Joi.number()
    .when(endMonthProperty, {
      switch: [
        { is: 2, then: Joi.number().integer().min(1).max(28).required() },
        { is: 4, then: Joi.number().integer().min(1).max(30).required() },
        { is: 6, then: Joi.number().integer().min(1).max(30).required() },
        { is: 9, then: Joi.number().integer().min(1).max(30).required() },
        { is: 11, then: Joi.number().integer().min(1).max(30).required() }
      ],
      otherwise: Joi.number().integer().min(1).max(31).required()
    })
}

module.exports = {
  go
}
