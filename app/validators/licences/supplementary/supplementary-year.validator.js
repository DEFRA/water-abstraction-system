'use strict'

/**
 * Validates data submitted for the `licences/{licenceId}/mark-for-supplementary-billing` page
 * @module SupplementaryYearValidator
 */

const Joi = require('joi')

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
function go (payload) {
  let years = payload.supplementaryYears

  if (!Array.isArray(years)) {
    years = [years]
  }

  const errorMessage = 'Select at least one financial year'

  const schema = Joi.object({
    years: Joi.array()
      .items(Joi.string())
      .required()
      .messages({
        'any.required': errorMessage,
        'array.sparse': errorMessage
      })
  })

  return schema.validate({ years }, { abortEarly: true })
}

module.exports = {
  go
}
