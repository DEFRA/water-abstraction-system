'use strict'

/**
 * Validates data submitted for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @module AbstractionPeriodValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../../presenters/base.presenter.js')

/**
 * Validates data submitted for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const {
    'start-abstraction-period-day': startDay,
    'start-abstraction-period-month': startMonth,
    'end-abstraction-period-day': endDay,
    'end-abstraction-period-month': endMonth
  } = payload

  const parsedPayload = {
    startDate: _parseDate(startDay, startMonth),
    endDate: _parseDate(endDay, endMonth)
  }

  return {
    startResult: _validateAbstractionDate(parsedPayload.startDate, 'start'),
    endResult: _validateAbstractionDate(parsedPayload.endDate, 'end')
  }
}

function _parseDate(day, month) {
  const parsedDay = day ? leftPadZeroes(day, 2) : ''
  const parsedMonth = month ? leftPadZeroes(month, 2) : ''

  return {
    entry: `${parsedDay}${parsedMonth}`,
    fullDate: `1970-${parsedMonth}-${parsedDay}`
  }
}

function _validateAbstractionDate(date, type) {
  const schema = Joi.object({
    entry: Joi.string()
      .required()
      .messages({
        'string.empty': `Enter the abstraction period ${type} date`
      }),
    fullDate: Joi.date()
      .format(['YYYY-MM-DD'])
      .required()
      .messages({
        'date.base': `Enter a valid ${type} date`,
        'date.format': `Enter a valid ${type} date`
      })
  })

  return schema.validate(date, { abortEarly: true })
}

module.exports = {
  go
}
