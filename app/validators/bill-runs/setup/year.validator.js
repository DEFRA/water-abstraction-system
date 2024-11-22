'use strict'

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/year` page
 * @module YearValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['2024', '2023', '2022', '2021']

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/year` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    year: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select the financial year',
        'any.only': 'Select the financial year',
        'string.empty': 'Select the financial year'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
