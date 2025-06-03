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
  const VALID_VALUES = Object.values(thresholdUnits).map((unit) => {
    return unit.value
  })

  const thresholdErrorMessage = 'Enter a threshold'

  const schema = Joi.object({
    unit: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select which units to use',
        'any.only': 'Select which units to use'
      }),
    threshold: Joi.number()
      .required()
      .positive()
      .max(MAX_VALUE)
      .messages({
        'any.required': thresholdErrorMessage,
        'any.only': thresholdErrorMessage,
        'number.max': `Enter a threshold less than ${MAX_VALUE}`,
        'number.base': thresholdErrorMessage,
        'number.positive': 'Enter a threshold of 0 or greater',
        'number.unsafe': 'Enter a threshold of 0 or greater'
      })
  })

  // The key of the threshold field is dynamic based on the unit selected. We therefore identify the field and extract
  // it into a new object along with the unit, which we then pass to the validator
  const dataToValidate = {
    threshold: payload[`threshold-${payload.unit}`] ?? undefined,
    unit: payload.unit
  }

  return schema.validate(dataToValidate, { abortEarly: false })
}

module.exports = {
  go
}
