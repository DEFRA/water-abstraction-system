'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'abstraction-below-100-cubic-metres-per-day',
  'returns-exception',
  'transfer-licence'
]

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/no-returns-required` page
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const schema = Joi.object({
    reason: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select the reason for the requirements for returns',
        'any.only': 'Select the reason for the requirements for returns',
        'string.empty': 'Select the reason for the requirements for returns'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
