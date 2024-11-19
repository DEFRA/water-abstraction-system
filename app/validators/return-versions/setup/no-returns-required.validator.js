'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'abstraction-below-100-cubic-metres-per-day',
  'licence-conditions-do-not-require-returns',
  'returns-exception',
  'temporary-trade'
]

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/no-returns-required` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (payload) {
  const schema = Joi.object({
    reason: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select the reason for no returns required',
        'any.only': 'Select the reason for no returns required',
        'string.empty': 'Select the reason for no returns required'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
