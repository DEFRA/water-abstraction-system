'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/purpose` page
 * @module PurposeValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/purpose` page
 *
 * When setting up a requirement users must specify a purpose for the return requirement.
 * Users must select one or more purposes linked to the licence. If these requirements are not met
 * the validation will return an error.
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} The result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go (payload, purposeIds) {
  const purposes = payload.purposes

  const errorMessage = 'Select any purpose for the requirements for returns'

  const schema = Joi.object({
    purposes: Joi.array()
      .items(Joi.string().valid(...purposeIds))
      .required()
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'array.includesOne': errorMessage,
        'array.includes': errorMessage,
        'array.sparse': errorMessage
      })
  })

  return schema.validate({ purposes }, { abortEarly: false })
}

module.exports = {
  go
}
