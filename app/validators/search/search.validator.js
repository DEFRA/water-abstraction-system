'use strict'

/**
 * Validates data submitted for the `/search` page
 *
 * @module SearchValidator
 */

const Joi = require('joi')

const ERROR_MESSAGE =
  'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
const MAX_LENGTH = 100

/**
 * Validates data submitted for the `/search` page.
 *
 * The search query text is limited to 100 characters, this is purely to prevent abuse of the search functionality, as
 * it is not expected that a user would ever need to enter more.
 *
 * @param {object} payload - The request payload to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). If any errors are found the `error` property will
 * also exist detailing what the issue is.
 */
function go(payload) {
  const schema = Joi.object({
    query: Joi.string()
      .trim()
      .required()
      .max(MAX_LENGTH)
      .messages({
        'any.required': ERROR_MESSAGE,
        'string.base': ERROR_MESSAGE,
        'string.empty': ERROR_MESSAGE,
        'string.max': `Search query must be ${MAX_LENGTH} characters or less`
      })
  })

  return schema.validate(payload, { abortEarly: true })
}

module.exports = {
  go
}
