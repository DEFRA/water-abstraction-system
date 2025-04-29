'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 * @module VolumesValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const maxAllowedVolume = 9999999999

  const schema = Joi.object().pattern(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // Regex to match keys like '2024-04-01T00:00:00.000Z'
    Joi.number()
      .min(0)
      .max(maxAllowedVolume)
      .messages({
        'number.base': 'Volume must be a number or blank',
        'number.min': 'Volume must be a positive number',
        'number.max': `Volume entered exceeds the maximum of ${maxAllowedVolume}`,
        'number.unsafe': `Volume entered exceeds the maximum of ${maxAllowedVolume}`
      })
  )

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
