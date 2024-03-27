'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodPresenter
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../presenters/base.presenter.js')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/abstraction-period` page
 *
 * When setting up a requirement, users must specify an abstraction period for the return requirement. Users must input a valid from and to
 * date for the licence. If there requirements are not met the validation will return an error.
 *
 * @param {Object} payload - The payload from the request to be validated.
 *
 * @returns {Object} - The result from calling Joi's schema.validate(). If any error are found the 'error: ' property will
 * also exist detailing what the issue is.
 */
function go (payload) {
  const {
    'fromAbstractionPeriod-day': fromDay,
    'fromAbstractionPeriod-month': fromMonth,
    'toAbstractionPeriod-day': toDay,
    'toAbstractionPeriod-month': toMonth
  } = payload

  const parsedPayload = _parsePayload(fromDay, fromMonth, toDay, toMonth)

  const result = {
    // NOTE: Because the fromDate and toDate both return slightly different error messages, the payloads are passed to
    // two separate Joi validation schemas which return the appropriate error message. Once validated, they are passed
    // back to the result and returned.
    fromResult: _validateAbstractionFromDate(parsedPayload.fromDate),
    toResult: _validateAbstractionToDate(parsedPayload.toDate)
  }

  return result
}

function _parsePayload (fromDay, fromMonth, toDay, toMonth) {
  const parsedFromDay = fromDay ? leftPadZeroes(fromDay, 2) : ''
  const parsedFromMonth = fromMonth ? leftPadZeroes(fromMonth, 2) : ''
  const parsedToDay = toDay ? leftPadZeroes(toDay, 2) : ''
  const parsedToMonth = toMonth ? leftPadZeroes(toMonth, 2) : ''

  const parsePayload = {
    fromDate: {
      entry: `${parsedFromDay}${parsedFromMonth}`,
      fullDate: `2023-${parsedFromMonth}-${parsedFromDay}`
    },
    toDate: {
      entry: `${parsedToDay}${parsedToMonth}`,
      fullDate: `2023-${parsedToMonth}-${parsedToDay}`
    }
  }

  return parsePayload
}

function _validateAbstractionFromDate (fromDate) {
  const schema = Joi.object({
    entry: Joi.string()
      .required()
      .messages({
        'string.empty': 'Select the from date of the abstraction period'
      }),
    fullDate: Joi.date()
      .format(['YYYY-MM-DD'])
      .required()
      .messages({
        'date.base': 'Enter a real from date',
        'date.format': 'Enter a real from date'
      })
  })

  return schema.validate(fromDate, { abortEarly: true })
}

function _validateAbstractionToDate (toDate) {
  const schema = Joi.object({
    entry: Joi.string()
      .required()
      .messages({
        'string.empty': 'Select the to date of the abstraction period'
      }),
    fullDate: Joi.date()
      .format(['YYYY-MM-DD'])
      .required()
      .messages({
        'date.base': 'Enter a real to date',
        'date.format': 'Enter a real to date'
      })
  })

  return schema.validate(toDate, { abortEarly: true })
}

module.exports = {
  go
}
