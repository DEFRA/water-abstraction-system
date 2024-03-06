'use strict'

/**
 * Validates data submitted for the `/bill-runs/create/{sessionId}/year` page
 * @module BillRunsCreateYearValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/bill-runs/create/{sessionId}/year` page
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data, years) {
  const validValues = years.map((year) => {
    return year.toString()
  })

  const schema = Joi.object({
    year: Joi.string()
      .required()
      .valid(...validValues)
      .messages({
        'any.required': 'Select the financial year',
        'any.only': 'Select the financial year',
        'string.empty': 'Select the financial year'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
