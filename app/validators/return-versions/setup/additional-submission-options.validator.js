'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/additional-submission-options` page
 *
 * When setting up a requirement users must specify additional-submission-options for the return requirement.
 * Users must select one or more points linked to the licence.
 * If these requirements are not met the validation will return an error.
 *
 * @param {object} options - The options extracted from payload taken from the request to be validated
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go (payload) {
  const additionalSubmissionOptions = payload.additionalSubmissionOptions

  const errorMessage = 'Select additional submission options for the requirements for returns'

  const schema = Joi.object({
    additionalSubmissionOptions: Joi.array()
      .items(Joi.string())
      .required()
  }).messages({
    'any.required': errorMessage,
    'array.sparse': errorMessage
  })

  return schema.validate({ additionalSubmissionOptions }, { abortEarly: false })
}

module.exports = {
  go
}
