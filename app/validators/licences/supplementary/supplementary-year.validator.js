'use strict'

/**
 * Validates data submitted for the `licences/{licenceId}/mark-for-supplementary-billing` page
 * @module SupplementaryYearValidator
 */

const Joi = require('joi')

const ERROR_MESSAGE = 'Select at least one financial year'

/**
 * Validates data submitted for the `licences/{licenceId}/mark-for-supplementary-billing` page
 *
 * When marking a licence for supplementary billing, the user must specify which years they want marked
 * Users must select one or more years to mark. If no years are marked the validation will return an error.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    supplementaryYears: Joi.array()
      .items(Joi.string())
      .single() // allows string to be treated as [string]
      .required()
      .messages({
        'any.required': ERROR_MESSAGE,
        'array.sparse': ERROR_MESSAGE
      })
  })

  return schema.validate(payload, { abortEarly: true })
}

module.exports = {
  go
}
