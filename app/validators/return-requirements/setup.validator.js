'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/setup` page
 * @module SetupValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'use_abstraction_data',
  'copy_an_existing_return_requirement'
]

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/setup` page
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const errorMessage = 'Select how you want to set up the return requirement'
  const schema = Joi.object({
    reason: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
