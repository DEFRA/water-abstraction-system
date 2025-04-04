'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/frequency-reported` page
 * @module FrequencyReportedValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/frequency-reported` page
 *
 * When setting up a requirement users must specify how frequently readings are reported for the return requirement.
 * Users must select one frequency for the returns cycle. If this requirement is not met the validation will return an
 * error.
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go(payload) {
  const frequencyReported = payload.frequencyReported

  const VALID_VALUES = ['day', 'week', 'month']

  const errorMessage = 'Select how often readings or volumes are reported'

  const schema = Joi.object({
    frequencyReported: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate({ frequencyReported }, { abortEarly: false })
}

module.exports = {
  go
}
