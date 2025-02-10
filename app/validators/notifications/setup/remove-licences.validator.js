'use strict'

/**
 * Validates data submitted for the `/notifications/setup/remove-licences` page
 * @module RemoveLicencesValidator
 */

const Joi = require('joi')

const errorMessage = 'Separate the licence numbers with a comma or new line'
// Regex to check the overall format: license numbers separated by commas or newlines
// (with flexible spacing), but not adjacent separators.
const formatRegex = /^\s*([^\s,]+(?:(?:\s*,\s*|\s*\n\s*)[^\s,]+)*)\s*$/
// Regex to specifically check for adjacent commas and newlines (e.g., ",\n" or "\n,").
const adjacentRegex = /(?:,\s*\n)|(?:\n\s*,)/

/**
 * Validates data submitted for the `/notifications/setup/remove-licences` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    removeLicences: Joi.string()
      .allow('')
      .custom((value, helpers) => {
        if (!value) return value // Allow empty string

        if (!formatRegex.test(value) || adjacentRegex.test(value)) {
          return helpers.message(errorMessage)
        }

        return value
      }, 'Licence Validation')
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
