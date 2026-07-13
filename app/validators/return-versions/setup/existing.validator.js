/**
 * Validates data submitted for the `/return-requirements/{sessionId}/existing` page
 * @module ExistingValidator
 */

import Joi from 'joi'

const errorMessage = 'Select a return version'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/existing` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object[]} returnVersions - The list of return versions from the DB
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
export default function existing(payload, returnVersions) {
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

  return schema.validate(payload, { abortEarly: false })
}
