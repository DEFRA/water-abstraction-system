'use strict'

/**
 * Validates data submitted for abstraction periods
 * @module AbstractionPeriodValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../presenters/base.presenter.js')

/**
 * Validates data submitted for abstraction periods
 *
 * The payload is expected to contain the following properties, which can be either strings or numbers:
 *
 * - abstraction-period-start-day
 * - abstraction-period-start-month
 * - abstraction-period-end-day
 * - abstraction-period-end-month
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {{startResult: object, endResult: object}} - An object containing validation results for the start and end
 * dates. Each result object will be the output of Joi's schema.validate(). If any errors are found, the 'error'
 * property will be present, detailing the issue.
 */
function go(payload) {
  const {
    'abstraction-period-start-day': startDay,
    'abstraction-period-start-month': startMonth,
    'abstraction-period-end-day': endDay,
    'abstraction-period-end-month': endMonth
  } = payload

  const parsedStartDate = _parseDate(startDay, startMonth)
  const parsedEndDate = _parseDate(endDay, endMonth)

  return {
    startResult: _validateAbstractionDate(parsedStartDate, 'start'),
    endResult: _validateAbstractionDate(parsedEndDate, 'end')
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
        'string.empty': `Select the ${type} date of the abstraction period`
      }),
    fullDate: Joi.date()
      .format(['YYYY-MM-DD'])
      .required()
      .messages({
        'date.base': `Enter a real ${type} date`,
        'date.format': `Enter a real ${type} date`
      })
  })

  return schema.validate(date, { abortEarly: true })
}

module.exports = {
  go
}
