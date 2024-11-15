'use strict'

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/season` page
 * @module SeasonValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'summer',
  'winter_all_year'
]

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/season` page
 *
 * @param {object} data - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const schema = Joi.object({
    season: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select the season',
        'any.only': 'Select the season',
        'string.empty': 'Select the season'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
