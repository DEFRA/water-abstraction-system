/**
 * Validates data submitted for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @module LicencesValidator
 */

import Joi from 'joi'

const errorMessage = 'Select the licences they should get water abstraction alerts emails for'

/**
 * Validates data submitted for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
export default function licencesValidator(payload) {
  const schema = Joi.object({
    licences: Joi.array().min(1).required().messages({
      'any.required': errorMessage,
      'array.base': errorMessage,
      'array.min': errorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}
