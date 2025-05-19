'use strict'

/**
 * Validates data submitted for the `/notices` page
 * @module IndexValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../presenters/base.presenter.js')

const NOTICE_TYPES = [
  'legacyNotifications',
  'paperReturnForms',
  'reduce',
  'resume',
  'returnReminder',
  'returnInvitation',
  'stop',
  'warning'
]

/**
 * Validates data submitted for the `/notices` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  payload.fromDate = _fullDate('sentFromDay', 'sentFromMonth', 'sentFromYear', payload)
  payload.toDate = _fullDate('sentToDay', 'sentToMonth', 'sentToYear', payload)

  return _validate(payload)
}

/**
 * A custom JOI validation function that checks that the fromDate is before or equal to the toDate.
 *
 * @param {object} value - the value to be validated
 * @param {object} helpers - a Joi object containing a numbers of helpers
 *
 * @returns {object} If the `fromDate` is before or equal to the `toDate`, the value is returned. Else, a Joi error
 * is returned.
 */
function _fromDateBeforeToDate(value, helpers) {
  const { toDate, fromDate } = value

  if (toDate === undefined || fromDate === undefined || fromDate <= toDate) {
    return value
  }

  // NOTE: If we can set `path[]` then the calling service can use the same logic to convert errors into UI errors, e.g.
  // `{ text, href }` no matter which field failed.
  // The Joi documentation for the helpers is rubbish but we were fortunate enough to find this issue
  // https://github.com/hapijs/joi/issues/2874 which gave us the solution to set `path[]` in the validation result we
  // return
  return helpers.error('any.custom', undefined, {
    ...helpers.state,
    path: ['fromDate']
  })
}

function _fullDate(dayKey, monthKey, yearKey, payload) {
  const day = payload[dayKey] ? payload[dayKey] : ''
  const month = payload[monthKey] ? payload[monthKey] : ''
  const year = payload[yearKey] ? payload[yearKey] : ''

  const paddedMonth = month ? leftPadZeroes(month, 2) : ''
  const paddedDay = day ? leftPadZeroes(day, 2) : ''

  const dateValue = `${year}-${paddedMonth}-${paddedDay}`

  if (dateValue === '--') {
    return undefined
  }

  return dateValue
}

function _validate(payload) {
  const schema = Joi.object({
    fromDate: Joi.date().format(['YYYY-MM-DD']).max('now').optional().messages({
      'date.base': 'Enter a valid from date',
      'date.format': 'Enter a valid from date',
      'date.max': "From date must be either today's date or in the past"
    }),
    noticeTypes: Joi.array()
      .items(Joi.string().valid(...NOTICE_TYPES))
      .optional()
      .messages({
        'any.only': 'Select a valid notice type'
      }),
    sentBy: Joi.string().max(255).optional().messages({
      'string.max': 'Sent by must be 255 characters or less'
    }),
    toDate: Joi.date().format(['YYYY-MM-DD']).max('now').optional().messages({
      'date.base': 'Enter a valid to date',
      'date.format': 'Enter a valid to date',
      'date.max': "To date must be either today's date or in the past"
    })
  })
    .custom(_fromDateBeforeToDate, 'From date before to date')
    .messages({ 'any.custom': 'The from date must be before the to date' })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

module.exports = {
  go
}
