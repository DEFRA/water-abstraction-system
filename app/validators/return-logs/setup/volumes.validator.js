'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 * @module VolumesValidator
 */

const Joi = require('joi')

const MAX_ALLOWED_VOLUME = 9999999999

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object().pattern(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // Regex to match keys like '2024-04-01T00:00:00.000Z'
    Joi.number()
      .min(0)
      .max(MAX_ALLOWED_VOLUME)
      .messages({
        'number.base': 'Volume must be a number or blank',
        'number.min': 'Volume must be a positive number',
        'number.max': `Volume entered exceeds the maximum of ${MAX_ALLOWED_VOLUME}`,
        'number.unsafe': `Volume entered exceeds the maximum of ${MAX_ALLOWED_VOLUME}`
      })
  )

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
