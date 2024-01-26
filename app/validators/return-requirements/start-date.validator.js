'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDateValidator
 */

const Joi = require('joi')

const { leftPadZeroes } = require('../../presenters/base.presenter.js')

function go (payload, licenceStartDate, licenceEndDate) {
  const { startDate } = payload

  const schema = _createSchema(licenceStartDate, licenceEndDate)

  if (startDate === 'anotherStartDate') {
    payload.fullDate = _fullDate(payload)
  }

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

function _createSchema (licenceStartDate, licenceEndDate) {
  return Joi.object({
    startDate: Joi.string().required().messages({
      'string.empty': 'Select the start date for the return requirement'
    }),
    fullDate: Joi.when('startDate', {
      is: 'anotherStartDate',
      then: Joi.date().iso().required().greater(licenceStartDate).less(licenceEndDate || '9999-12-31').messages({
        'date.base': 'Enter a real start date',
        'date.format': 'Enter a real start date',
        'date.greater': 'Start date must be after the original licence start date',
        'date.less': 'Start date must be before the licence end date',
        'any.required': 'Select the start date for the return requirement'
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
