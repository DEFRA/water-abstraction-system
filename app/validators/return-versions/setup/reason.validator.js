/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 * @module ReasonValidator
 */

import Joi from 'joi'

import { returnRequirementReasons } from '../../../lib/static-lookups.lib.js'

const errorMessage = 'Select the reason for the requirements for returns'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
export default function go(payload) {
  const validValues = Object.keys(returnRequirementReasons)

  const schema = Joi.object({
    reason: Joi.string()
      .required()
      .valid(...validValues)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(payload, { abortEarly: false })
}
