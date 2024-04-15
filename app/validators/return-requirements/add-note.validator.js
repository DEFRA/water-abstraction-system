'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/add-note` page
 * @module AddNoteValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/add-note` page
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const errorMessage = 'Text must be entered'
  const textareaErrorMessage = 'Textarea should have a value with character count less than 500'
  const schema = Joi.object({
    setup: Joi.string()
      .required()
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      }),
    textarea: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.base': textareaErrorMessage,
        'string.empty': textareaErrorMessage,
        'string.max': textareaErrorMessage
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
