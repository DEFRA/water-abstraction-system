'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/received` page
 * @module ReceivedDateValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../../presenters/base.presenter.js')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/received` page
 *
 * When entering a return log users must specify a received date for when the return was received by. The page
 * allows them to select todays date, yesterdays date or enter a custom date.
 *
 * The custom date uses a {@link https://design-system.service.gov.uk/components/date-input/ | GOV.UK date input}
 * which is 3 text fields for day, month and year. Users can enter what they like or omit a value completely which is
 * why date validation can become quite complex.
 *
 * Also, the date they enter cannot be before the start date of the return or a date in the future.
 *
 * Finally, we also need to validate that the user selected one of the options; todays, yesterday or a custom
 * date.
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {string} startDate - The date the return log starts from
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, startDate) {
  const { 'received-date-options': selectedOption } = payload

  if (selectedOption === 'custom-date') {
    payload.fullDate = _fullDate(payload)

    return _validateCustomReceivedDate(payload, startDate)
  }
  return _validateReceivedDate(payload)
}

function _fullDate(payload) {
  const { 'received-date-day': day, 'received-date-month': month, 'received-date-year': year } = payload

  const paddedMonth = month ? leftPadZeroes(month, 2) : ''
  const paddedDay = day ? leftPadZeroes(day, 2) : ''

  return `${year}-${paddedMonth}-${paddedDay}`
}

function _validateCustomReceivedDate(payload, startDate) {
  const schema = Joi.object({
    fullDate: Joi.date().format(['YYYY-MM-DD']).required().min(startDate).less('now').messages({
      'date.base': 'Enter a return received date',
      'date.format': 'Enter a real received date',
      'date.min': 'Received date must be the return period start date or after it',
      'date.less': "Received date must be either today's date or in the past"
    }),
    otherwise: Joi.forbidden()
  })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

function _validateReceivedDate(payload) {
  const schema = Joi.object({
    'received-date-options': Joi.string().required().messages({
      'any.required': 'Select the return received date',
      'string.empty': 'Select the return received date'
    })
  })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

module.exports = {
  go
}
