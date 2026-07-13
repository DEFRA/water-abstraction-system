/**
 * Validates data submitted for the '/users/internal/setup/{sessionId}/access' page
 *
 * @module AccessValidator
 */

import Joi from 'joi'

/**
 * Validates data submitted for the '/users/internal/setup/{sessionId}/access' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
export default function access(payload) {
  const schema = Joi.object({
    access: Joi.string().required().valid('enabled', 'disabled').messages({
      'any.required': 'Select access for the user',
      'any.only': 'Select a valid access option for the user'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}
