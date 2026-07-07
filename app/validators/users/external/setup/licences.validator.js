/**
 * Validates data submitted for the `/users/external/setup/{sessionId}/licences` page
 * @module LicencesValidator
 */

import Joi from 'joi'

/**
 * Validates data submitted for the `/users/external/setup/{sessionId}/licences` page
 *
 * Users must select one or more licences to be unregistered for the payload to be valid. Where there is more than one
 * licence, there is an 'All licences' option. But we deal with that back in the service. As far as the validator is
 * concerned, they just need to have checked at least one checkbox.
 *
 * @param {object} payload - The payload taken from the request to be validated
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go(payload) {
  const errorMessage = 'Select licences to unregister'

  const schema = Joi.object({
    licences: Joi.array().items(Joi.string()).min(1).required()
  }).messages({
    'any.required': errorMessage,
    'array.min': errorMessage,
    'array.sparse': errorMessage,
    'string.base': errorMessage
  })

  return schema.validate(payload, { abortEarly: false })
}

export default {
  go
}
