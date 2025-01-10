'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/reported` page
 * @module ReportedValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/reported` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const reported = payload.reported

  const VALID_VALUES = ['meter-readings', 'abstraction-volumes']
  const errorMessage = 'Select how this return was reported'

  const schema = Joi.object({
    reported: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate({ reported }, { abortEarly: false })
}

module.exports = {
  go
}
