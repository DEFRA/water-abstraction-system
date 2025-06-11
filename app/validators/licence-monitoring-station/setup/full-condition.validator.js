'use strict'

/**
 * Validates data submitted for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @module FullConditionValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for `/licence-monitoring-station/setup/{sessionId}/full-condition`
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const conditionErrorMessage = 'Select a condition'

  const schema = Joi.object({
    condition: Joi.alternatives()
      .try(Joi.string().valid('no_conditions', 'not_listed'), Joi.string().uuid())
      .required()
      .messages({
        'any.required': conditionErrorMessage,
        'any.only': conditionErrorMessage,
        'string.empty': conditionErrorMessage
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
