'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/period-used` page
 * @module PeriodUsedValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../../presenters/base.presenter.js')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/period-used` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {Date} startDate - The start date of the period to validate the custom date entered by the user
 * @param {Date} endDate - The end date of the period to validate the custom date entered by the user
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, startDate, endDate) {
  const {
    'period-used-from-day': startDay,
    'period-used-from-month': startMonth,
    'period-used-from-year': startYear,
    'period-used-to-day': endDay,
    'period-used-to-month': endMonth,
    'period-used-to-year': endYear
  } = payload

  payload.fromFullDate = _fullDate(startDay, startMonth, startYear)
  payload.toFullDate = _fullDate(endDay, endMonth, endYear)

  return _validateDate(payload, startDate, endDate)
}

/**
 * A custom JOI validation function that checks that the fromFullDate is before or equal to the toFullDate.
 *
 * @param {object} value - the value to be validated
 * @param {object} helpers - a Joi object containing a numbers of helpers
 *
 * @returns {object} If the fromFullDate is before or equal to the toFullDate, the value is returned. Else, a Joi error
 * is returned.
 */
function _fromDateBeforeToDate(value, helpers) {
  const { toFullDate, fromFullDate } = value

  if (fromFullDate <= toFullDate) {
    return value
  }

  return helpers.error('any.invalid')
}

function _fullDate(day, month, year) {
  if (!year || !month || !day) {
    return null
  }

  const paddedMonth = month ? leftPadZeroes(month, 2) : ''
  const paddedDay = day ? leftPadZeroes(day, 2) : ''

  return new Date(`${year}-${paddedMonth}-${paddedDay}`)
}

function _validateDate(payload, startDate, endDate) {
  const schema = Joi.object({
    periodDateUsedOptions: Joi.string().required().messages({
      'any.required': 'Select what period was used for this volume',
      'string.empty': 'Select what period was used for this volume'
    }),
    fromFullDate: Joi.alternatives().conditional('periodDateUsedOptions', {
      is: 'custom-dates',
      then: Joi.date().format(['YYYY-MM-DD']).min(startDate).required().messages({
        'date.base': 'Enter a valid from date',
        'date.format': 'Enter a valid from date',
        'date.min': 'The from date must be within the return period start date'
      }),
      otherwise: Joi.optional() // Ensures this field is ignored if not using 'custom-dates'
    }),
    toFullDate: Joi.alternatives().conditional('periodDateUsedOptions', {
      is: 'custom-dates',
      then: Joi.date().format(['YYYY-MM-DD']).max(endDate).required().messages({
        'date.base': 'Enter a valid to date',
        'date.format': 'Enter a valid to date',
        'date.max': 'The to date must be within the return periods end date'
      }),
      otherwise: Joi.optional() // Ensures this field is ignored if not using 'custom-dates'
    })
  })
    .custom(_fromDateBeforeToDate, 'From date before to date')
    .messages({
      'any.invalid': 'The from date must be before the to date'
    })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

module.exports = {
  go
}
