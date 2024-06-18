'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/existing` page
 * @module ExistingValidator
 */

const Joi = require('joi')

const errorMessage = 'Select a previous requirements for returns'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/existing` page
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data, returnVersions) {
  const returnVersionIds = returnVersions.map((returnVersion) => {
    return returnVersion.id
  })

  const schema = Joi.object({
    existing: Joi.string()
      .required()
      .valid(...returnVersionIds)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
