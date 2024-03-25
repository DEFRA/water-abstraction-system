'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodPresenter
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../presenters/base.presenter.js')

function go (payload) {
  const {
    'fromAbstractionPeriod-day': fromDay,
    'fromAbstractionPeriod-month': fromMonth,
    'toAbstractionPeriod-day': toDay,
    'toAbstractionPeriod-month': toMonth
  } = payload

  const parsedPayload = _parsePayload(fromDay, fromMonth, toDay, toMonth)

  const result = {
    fromResult: _validateAbstractionFromDate(parsedPayload.fromDate),
    toResult: _validateAbstractionToDate(parsedPayload.toDate)
  }

  return result
}

function _parsePayload (fromDay, fromMonth, toDay, toMonth) {
  const parsedFromDay = fromDay ? leftPadZeroes(fromMonth, 2) : ''
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
