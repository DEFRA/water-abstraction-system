'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDateValidator
 */

const Joi = require('joi')

const { leftPadZeroes } = require('../../presenters/base.presenter.js')

function go (payload, licenceStartDate, licenceEndDate) {
  const { startDate } = payload
  const customErrorMessages = {
    dateGreaterThan: 'Start date must be after the original licence start date',
    dateLessThan: 'Start date must be before the licence end date',
    realStartDate: 'Enter a real start date',
    selectStartDate: 'Select the start date for the return requirement'
  }

  const schema = _createSchema(licenceStartDate, licenceEndDate, customErrorMessages)

  if (startDate === 'anotherStartDate') {
    payload.fullDate = _fullDate(payload)
  }

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

function _createSchema (licenceStartDate, licenceEndDate, customErrorMessages) {
  return Joi.object({
    startDate: Joi.string().required().messages({
      'string.empty': customErrorMessages.selectStartDate
    }),
    fullDate: Joi.when('startDate', {
      is: 'anotherStartDate',
      then: Joi.date().iso().required().greater(licenceStartDate).less(licenceEndDate || '9999-12-31').messages({
        'date.base': customErrorMessages.realStartDate,
        'date.format': 'Enter a real start date',
        'date.greater': customErrorMessages.dateGreaterThan,
        'date.less': customErrorMessages.dateLessThan,
        'any.required': customErrorMessages.selectStartDate
      }),
      otherwise: Joi.forbidden()
    })
  })
}

function _fullDate (payload) {
  const {
    'start-date-day': day,
    'start-date-month': month,
    'start-date-year': year
  } = payload

  const paddedMonth = month ? leftPadZeroes(month, 2) : ''
  const paddedDay = day ? leftPadZeroes(day, 2) : ''

  return `${year}-${paddedMonth}-${paddedDay}`
}

module.exports = {
  go
}
