'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/submission` page
 * @module SubmissionValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['enter-return', 'nil-return', 'record-receipt']

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/submission` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Select what you want to do with this return'

  const schema = Joi.object({
    journey: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
