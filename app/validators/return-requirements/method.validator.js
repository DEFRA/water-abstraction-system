'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/method` page
 * @module SetupValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'use-abstraction-data',
  'use-existing-requirements',
  'set-up-manually'
]

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/method` page
 *
 * @param {object} data - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const errorMessage = 'Select how you want to set up the requirements for returns'
  const schema = Joi.object({
    method: Joi.string()
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
