'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDateValidator
 */

const Joi = require('joi')

function go (data, licenceStartDate, licenceEndDate) {
  const schema = Joi.object({
    day: Joi.string().required(),
    month: Joi.string().required(),
    year: Joi.string().required(),
    date: Joi.string()
      .custom((value, helpers) => {
        const dateParts = value.split('/')
        const day = parseInt(dateParts[0], 10)
        const month = parseInt(dateParts[1], 10) - 1 // JS months are 0-based
        const year = parseInt(dateParts[2], 10)
        const date = new Date(year, month, day)

        // Check if date is valid
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
          return helpers.error('any.invalid')
        }

        // Check if date is after licence start date and before licence end date
        const licenceStart = new Date(licenceStartDate)
        const licenceEnd = new Date(licenceEndDate)

        if (date < licenceStart) {
          return helpers.error('date.min')
        }
        if (date > licenceEnd) {
          return helpers.error('date.max')
        }

        return value
      }, 'Date Validation')
      .messages({
        'any.invalid': 'Enter a real start date',
        'any.required': 'Select the start date for the return requirement',
        'date.min': 'Start date must be after the original licence start date',
        'date.max': 'Start date must be before the licence end date'
      })
  })

  const combinedData = {
    ...data,
    date: `${data.day}/${data.month}/${data.year}`
  }

  return schema.validate(combinedData, { abortEarly: false })
}

module.exports = {
  go
}
