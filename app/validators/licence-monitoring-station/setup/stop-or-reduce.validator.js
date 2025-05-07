'use strict'

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 * @module StopOrReduceValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const stopOrReduceErrorMessage = 'Select if the licence holder needs to stop or reduce'
  const reduceAtThresholdError =
    'Select if the licence holder needs to stop abstraction when they reach a certain amount'

  const schema = Joi.object({
    stopOrReduce: Joi.string()
      .required()
      .valid(...['reduce', 'stop'])
      .messages({
        'any.required': stopOrReduceErrorMessage,
        'any.only': stopOrReduceErrorMessage,
        'string.empty': stopOrReduceErrorMessage
      }),
    reduceAtThreshold: Joi.string()
      .valid(...['yes', 'no'])
      .when('stopOrReduce', { is: 'reduce', then: Joi.required() })
      .messages({
        'any.required': reduceAtThresholdError,
        'any.only': reduceAtThresholdError,
        'string.empty': reduceAtThresholdError
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
