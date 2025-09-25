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
    periodUsedFromDay,
    periodUsedFromMonth,
    periodUsedFromYear,
    periodUsedToDay,
    periodUsedToMonth,
    periodUsedToYear
  } = payload

  payload.fromFullDate = _fullDate(periodUsedFromDay, periodUsedFromMonth, periodUsedFromYear)
  payload.toFullDate = _fullDate(periodUsedToDay, periodUsedToMonth, periodUsedToYear)

  return _validateDate(payload, startDate, endDate)
}

function _fullDate(day, month, year) {
  if (!year && !month && !day) {
    return null
  }

  const paddedMonth = month ? leftPadZeroes(month, 2) : ''
  const paddedDay = day ? leftPadZeroes(day, 2) : ''

  return `${year}-${paddedMonth}-${paddedDay}`
}

function _validateDate(payload, startDate, endDate) {
  console.log(payload)
  const schema = Joi.object({
    periodDateUsedOptions: Joi.string().required().messages({
      'any.required': 'Select what period was used for this volume',
      'string.empty': 'Select what period was used for this volume'
    }),
    fromFullDate: Joi.alternatives().conditional('periodDateUsedOptions', {
      is: 'customDates',
      then: Joi.date().format(['YYYY-MM-DD']).min(startDate).less(Joi.ref('toFullDate')).required().messages({
        'date.base': 'Enter a valid from date',
        'date.format': 'Enter a valid from date',
        'date.min': 'The from date must be within the return period start date',
        'date.less': 'The from date must be before the to date'
      }),
      otherwise: Joi.optional() // Ensures this field is ignored if not using 'customDates'
    }),
    toFullDate: Joi.alternatives().conditional('periodDateUsedOptions', {
      is: 'customDates',
      then: Joi.date().format(['YYYY-MM-DD']).max(endDate).required().messages({
        'date.base': 'Enter a valid to date',
        'date.format': 'Enter a valid to date',
        'date.max': 'The to date must be within the return periods end date'
      }),
      otherwise: Joi.optional() // Ensures this field is ignored if not using 'customDates'
    })
  })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

module.exports = {
  go
}
