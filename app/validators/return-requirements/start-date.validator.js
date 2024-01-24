'use strict'

const Joi = require('joi')
function go (data) {
  const { licenceStartDate, licenceEndDate, startDate, 'start-date-day': day, 'start-date-month': month, 'start-date-year': year } = data
  const customErrorMessages = {
    dateGreaterThan: 'Start date must be after the original licence start date',
    dateLessThan: 'Start date must be before the licence end date',
    realStartDate: 'Enter a real start date',
    selectStartDate: 'Select the start date for the return requirement'
  }

  const schema = _createSchema(licenceStartDate, licenceEndDate, customErrorMessages)

  if (startDate === 'anotherStartDate') {
    const invalidFields = _validateDateFields(day, month, year)

    if (invalidFields.length) {
      return _createValidationError(data, customErrorMessages.realStartDate, invalidFields)
    }

    data.fullDate = _formatFullDate(day, month, year)
  }

  return schema.validate(data, { abortEarly: false, allowUnknown: true })
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
        'date.greater': customErrorMessages.dateGreaterThan,
        'date.less': customErrorMessages.dateLessThan,
        'any.required': customErrorMessages.selectStartDate
      }),
      otherwise: Joi.forbidden()
    })
  })
}

function _formatFullDate (day, month, year) {
  const formattedMonth = month.padStart(2, '0')
  const formattedDay = day.padStart(2, '0')
  return `${year}-${formattedMonth}-${formattedDay}`
}

function _validateDay (day) {
  const maxDays = 31
  return day && /^\d{1,2}$/.test(day) && day >= 1 && day <= maxDays
}

function _validateMonth (month) {
  const maxMonths = 12
  return month && /^\d{1,2}$/.test(month) && month >= 1 && month <= maxMonths
}

function _validateYear (year) {
  return year && /^\d{4}$/.test(year)
}

function _validateDateFields (day, month, year) {
  const invalidFields = []

  if (!_validateDay(day)) {
    invalidFields.push('day')
  }
  if (!_validateMonth(month)) {
    invalidFields.push('month')
  }
  if (!_validateYear(year)) {
    invalidFields.push('year')
  }

  return invalidFields
}

function _createValidationError (data, message, invalidFields) {
  const validationError = {
    value: data,
    error: {
      details: [{ message, invalidFields }]
    }
  }

  return validationError
}

module.exports = {
  go
}
