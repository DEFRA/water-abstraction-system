'use strict'

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit` page
 * @module ThresholdAndUnitValidator
 */

const Joi = require('joi')

const { thresholdUnits } = require('../../../lib/static-lookups.lib.js')

const MAX_VALUE = 10000000

/**
 * Validates data submitted for the `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const VALID_VALUES = Object.values(thresholdUnits)
  const thresholdErrorMessage = 'Enter a threshold'

  const schema = Joi.object({
    threshold: Joi.number()
      .required()
      .positive()
      .max(MAX_VALUE)
      .messages({
        'any.required': thresholdErrorMessage,
        'any.only': thresholdErrorMessage,
        'number.max': `Enter a threshold less than ${MAX_VALUE}`,
        'number.base': thresholdErrorMessage,
        'number.positive': thresholdErrorMessage
      }),
    unit: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.only': 'Select which units to use'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
