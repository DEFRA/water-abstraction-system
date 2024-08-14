'use strict'

/**
 * @module ImportLicenceVersionsValidator
 */

const Joi = require('joi')

const calender = {
  totalDaysInMonth: 31,
  totalMonthsInYear: 12
}
const validStatues = ['current', 'superseded']

/**
 * Checks that the data for inserting/updating the public.licence_versions
 * and public.licence_versions_purposes table is valid.
 *
 * @param {Array<{
 *   createdAt: string,
 *   endDate: string | null,
 *   externalId: string,
 *   increment: number,
 *   issue: number,
 *   startDate: string | null,
 *   status: string,
 *   updatedAt: string,
 *   purposes: Array<{
 *     abstractionPeriodEndDay: number,
 *     abstractionPeriodEndMonth: number,
 *     abstractionPeriodStartDay: number,
 *     abstractionPeriodStartMonth: number,
 *     annualQuantity: number | null,
 *     dailyQuantity: number | null,
 *     externalId: string,
 *     hourlyQuantity: number | null,
 *     instantQuantity: number | null,
 *     notes: string | null,
 *     primaryPurposeId: string,
 *     secondaryPurposeId: string,
 *     purposeId: string,
 *     timeLimitedEndDate: string | null,
 *     timeLimitedStartDate: string | null
 *   }>
 * }>} data - The data to be validated.
 *
 * @returns {void}
 * @throws {Error} If validation fails.
 */
function go (data) {
  const result = _schema.validate(data)

  if (Object.hasOwn(result, 'error')) {
    throw new Error(result.error.details[0].message)
  }
}

const _isValidStatus = (value) => {
  if (validStatues.includes(value)) {
    return value
  }

  throw new Error(`Status must be one of ${validStatues.toString()}`)
}

const _purposeSchema =
  Joi.array().min(1).items(
    Joi.object({
      primaryPurposeId: Joi.string().required(),
      secondaryPurposeId: Joi.string().required(),
      purposeId: Joi.string().required(),
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
      dailyQuantity: Joi.number().allow(null),
      createdAt: Joi.date().required(),
      updatedAt: Joi.date().required()
    }).label('Licence versions purpose')
  ).label('Licence versions purposes').messages({
    'array.min': 'A licence version must have at least one Licence version purpose'
  })

const _schema = Joi.array().min(1).items(
  Joi.object({
    endDate: Joi.date().iso().required().allow(null),
    externalId: Joi.string().required(),
    increment: Joi.number().required(),
    issue: Joi.number().required(),
    startDate: Joi.date().iso().required(),
    status: Joi.string().required().custom(_isValidStatus),
    purposes: _purposeSchema,
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required()
  })
    .label('Licence version')
)
  .label('Licence versions')
  .messages({
    'array.min': 'A licence must have at least one Licence version'
  })

module.exports = {
  go
}
