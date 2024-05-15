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
 * @param {Object} options - The options extracted from payload taken from the request to be validated
 *
 * @returns {Object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go (payload) {
  /**
  * NOTE: When a single point is checked by a user, it returns as a string.
  * When multiple additionalSubmissionOptions are checked, the 'payload' is returned as an array.
  * To make Joi validation straightforward, if the "payload['additional-submission-options']" is a string,
  * it is turned into an array and validated as such.
  */
  const additionalSubmissionOptions = payload['additional-submission-options']

  const errorMessage = 'Select additional submission options for the requirements for returns'

  const schema = Joi.object({
    'additional-submission-options': Joi.array()
      .items(Joi.string())
      .required()
  }).messages({
    'any.required': errorMessage,
    'array.sparse': errorMessage
  })

  return schema.validate({ 'additional-submission-options': additionalSubmissionOptions }, { abortEarly: false })
}

module.exports = {
  go
}
