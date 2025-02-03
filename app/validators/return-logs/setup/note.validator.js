'use strict'

/**
 * Validates data submitted for the `/return-logs/{sessionId}/note` page
 * @module NoteValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/{sessionId}/note` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Enter details'
  const maxErrorMessage = 'Enter no more than 500 characters'
  const schema = Joi.object({
    note: Joi.string().required().max(500).messages({
      'any.required': errorMessage,
      'any.only': errorMessage,
      'string.empty': errorMessage,
      'string.max': maxErrorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
