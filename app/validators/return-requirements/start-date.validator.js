'use strict'

const Joi = require('joi')

function go (data) {
  // Arrange
  const { licenceStartDate, licenceEndDate } = data
  const dateField = `${data.day}/${data.month}/${data.year}`

  const schema = Joi.object({
    day: Joi.string().required(),
    month: Joi.string().required(),
    year: Joi.string().required(),
    date: Joi.string()
      .custom((value, helpers) => {
        // Convert to date object
        const dateParts = value.split('/')
        const year = parseInt(dateParts[2], 10)
        const month = parseInt(dateParts[1], 10) - 1 // JS months are 0-based
        const day = parseInt(dateParts[0], 10)
        const date = new Date(year, month, day)

        // Validate if date is real
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
          return helpers.error('any.invalid')
        }

        // Validate against licence start date
        if (date < new Date(licenceStartDate)) {
          return helpers.error('date.min')
        }

        // Validate against licence end date, if it exists
        if (licenceEndDate && date > new Date(licenceEndDate)) {
          return helpers.error('date.max')
        }

        return value
      }, 'Date Validation')
      .messages({
        'any.invalid': 'Enter a real start date',
        'date.min': 'Start date must be after the original licence start date',
        'date.max': 'Start date must be before the licence end date'
      })
  })

  const validationResult = schema.validate({ ...data, date: dateField }, { abortEarly: false })
  return validationResult
}

module.exports = {
  go
}
