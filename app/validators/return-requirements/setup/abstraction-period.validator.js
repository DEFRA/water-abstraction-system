'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../../presenters/base.presenter.js')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/abstraction-period` page
 *
 * When setting up a requirement, users must specify an abstraction period for the return requirement. Users must input
 * a valid start-date and end-date for the licence. If these requirements are not met, the validation will return an
 * error.
 *
 * @param {object} payload - The payload from the request to be validated.
 *
 * @returns {object} - The result from calling Joi's schema.validate(). If any errors are found the 'error: ' property
 * will also exist, detailing what the issue is.
 */
function go (payload) {
  const {
    'start-abstraction-period-day': startDay,
    'start-abstraction-period-month': startMonth,
    'end-abstraction-period-day': endDay,
    'end-abstraction-period-month': endMonth
  } = payload

  const parsedPayload = _parsePayload(startDay, startMonth, endDay, endMonth)

  const result = {
    // NOTE: Because the startDate and endDate both return slightly different error messages, the payloads are passed to
    // two separate Joi validation schemas which return the appropriate error message. Once validated, they are passed
    // back to the result and returned.
    startResult: _validateAbstractionStartDate(parsedPayload.startDate),
    endResult: _validateAbstractionEndDate(parsedPayload.endDate)
  }

  return result
}

function _parsePayload (startDay, startMonth, endDay, endMonth) {
  const parsedStartDay = startDay ? leftPadZeroes(startDay, 2) : ''
  const parsedStartMonth = startMonth ? leftPadZeroes(startMonth, 2) : ''
  const parsedEndDay = endDay ? leftPadZeroes(endDay, 2) : ''
  const parsedEndMonth = endMonth ? leftPadZeroes(endMonth, 2) : ''

  const parsePayload = {
    startDate: {
      entry: `${parsedStartDay}${parsedStartMonth}`,
      fullDate: `2023-${parsedStartMonth}-${parsedStartDay}`
    },
    endDate: {
      entry: `${parsedEndDay}${parsedEndMonth}`,
      fullDate: `2023-${parsedEndMonth}-${parsedEndDay}`
    }
  }

  return parsePayload
}

function _validateAbstractionStartDate (startDate) {
  const schema = Joi.object({
    entry: Joi.string()
      .required()
      .messages({
        'string.empty': 'Select the start date of the abstraction period'
      }),
    fullDate: Joi.date()
      .format(['YYYY-MM-DD'])
      .required()
      .messages({
        'date.base': 'Enter a real start date',
        'date.format': 'Enter a real start date'
      })
  })

  return schema.validate(startDate, { abortEarly: true })
}

function _validateAbstractionEndDate (endDate) {
  const schema = Joi.object({
    entry: Joi.string()
      .required()
      .messages({
        'string.empty': 'Select the end date of the abstraction period'
      }),
    fullDate: Joi.date()
      .format(['YYYY-MM-DD'])
      .required()
      .messages({
        'date.base': 'Enter a real end date',
        'date.format': 'Enter a real end date'
      })
  })

  return schema.validate(endDate, { abortEarly: true })
}

module.exports = {
  go
}
