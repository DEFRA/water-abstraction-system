'use strict'

/**
 * Validates data submitted for the `/search` page
 * @module SearchValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/search` page
 *
 * @param {object} query - The query from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go(query) {
  const schema = Joi.object({
    query: Joi.string().required().max(100).messages({
      'any.required':
        'Enter a licence number, customer name, returns ID, registered email address or monitoring station',
      'string.max': 'Search query must be 100 characters or less'
    }),
    page: Joi.number().integer().positive().max(10).precision(0).messages({ '*': 'Provide a valid page number' })
  })

  return schema.validate(query, { abortEarly: false })
}

module.exports = {
  go
}
