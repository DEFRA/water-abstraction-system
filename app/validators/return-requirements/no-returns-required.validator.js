'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'abstraction_below_100_cubic_metres_per_day',
  'returns_exception',
  'transfer_licence'
]

function go (data) {
  const schema = Joi.object({
    'no-returns-required': Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select the reason for the return requirement',
        'any.only': 'Select the reason for the return requirement',
        'string.empty': 'Select the reason for the return requirement'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
