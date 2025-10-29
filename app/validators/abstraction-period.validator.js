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
 * - abstractionPeriodStartDay
 * - abstractionPeriodStartMonth
 * - abstractionPeriodEndDay
 * - abstractionPeriodEndMonth
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} - An object containing validation results for the start and end
 * dates. Each result object will be the output of Joi's schema.validate(). If any errors are found, the 'error'
 * property will be present, detailing the issue.
 */
function go(payload) {
  const { abstractionPeriodStartDay, abstractionPeriodStartMonth, abstractionPeriodEndDay, abstractionPeriodEndMonth } =
    payload

  const parsedStartDate = _parseDate(abstractionPeriodStartDay, abstractionPeriodStartMonth)
  const parsedEndDate = _parseDate(abstractionPeriodEndDay, abstractionPeriodEndMonth)

  return _validateAbstractionDate({
    abstractionPeriodStart: parsedStartDate,
    abstractionPeriodEnd: parsedEndDate
  })
}

function _parseDate(day, month) {
  if (!day || !month) {
    return null
  }
  const parsedDay = day ? leftPadZeroes(day, 2) : ''
  const parsedMonth = month ? leftPadZeroes(month, 2) : ''

  return `1970-${parsedMonth}-${parsedDay}`
}

function _validateAbstractionDate(payload) {
  const schema = Joi.object({
    abstractionPeriodStart: Joi.date().format(['YYYY-MM-DD']).required().messages({
      'date.base': `Select the start date of the abstraction period`,
      'date.format': 'Enter a real start date'
    }),
    abstractionPeriodEnd: Joi.date().format(['YYYY-MM-DD']).required().messages({
      'date.base': `Select the end date of the abstraction period`,
      'date.format': 'Enter a real end date'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
