'use strict'

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/type` page
 * @module TypeValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['annual', 'supplementary', 'two_part_supplementary', 'two_part_tariff']

/**
 * Validates data submitted for the `/bill-runs/setup/{sessionId}/type` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    type: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select the bill run type',
        'any.only': 'Select the bill run type',
        'string.empty': 'Select the bill run type'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
