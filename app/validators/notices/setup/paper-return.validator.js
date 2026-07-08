/**
 * Validates data submitted for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @module PaperReturnValidator
 */

import Joi from 'joi'

const errorMessage = 'Select the returns for the paper return'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
export default function go(payload) {
  const schema = Joi.object({
    returns: Joi.array().min(1).required().messages({
      'any.required': errorMessage,
      'any.only': errorMessage,
      'array.min': errorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}
