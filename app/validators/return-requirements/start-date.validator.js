'use strict'

const Joi = require('joi')

function go (data) {
  const { licenceStartDate, licenceEndDate, startDate, 'start-date-day': day, 'start-date-month': month, 'start-date-year': year } = data

  const customErrorMessages = {
    realStartDate: 'Enter a real start date',
    selectStartDate: 'Select the start date for the return requirement',
    dateGreaterThan: 'Start date must be after the original licence start date',
    dateLessThan: 'Start date must be before the licence end date'
  }

  const schema = Joi.object({
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

  if (startDate === 'anotherStartDate') {
    const invalidFields = _validateDateFields(day, month, year)

    if (invalidFields.length) {
      const validationError = _createValidationError(data, customErrorMessages.realStartDate, invalidFields)

      return validationError
    }

    const formattedMonth = month.padStart(2, '0')
    const formattedDay = day.padStart(2, '0')
    data.fullDate = `${year}-${formattedMonth}-${formattedDay}`
  }

  const validationResult = schema.validate(data, { abortEarly: false, allowUnknown: true })

  return validationResult
}

function _validateDateFields (day, month, year) {
  const invalidFields = []
  const isDayValid = day && /^\d{1,2}$/.test(day) && day >= 1 && day <= 31
  const isMonthValid = month && /^\d{1,2}$/.test(month) && month >= 1 && month <= 12
  const isYearValid = year && /^\d{4}$/.test(year)

  if (!isDayValid) invalidFields.push('day')
  if (!isMonthValid) invalidFields.push('month')
  if (!isYearValid) invalidFields.push('year')

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
