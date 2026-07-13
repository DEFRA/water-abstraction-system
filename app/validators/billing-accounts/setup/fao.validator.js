/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @module FAOValidator
 */

import Joi from 'joi'

const VALID_VALUES = ['yes', 'no']

/**
 * Validates data submitted for the `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
export default function (payload) {
  const errorMessage = 'Select yes if you need to add an FAO'

  const schema = Joi.object({
    fao: Joi.string()
      .valid(...VALID_VALUES)
      .required()
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(payload, { abortEarly: false })
}
