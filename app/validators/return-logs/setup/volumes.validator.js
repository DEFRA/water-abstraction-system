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
  const schema = Joi.object().pattern(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // Regex to match keys like '2024-04-01T00:00:00.000Z'
    Joi.number()
      .min(0)
      .messages({
        'number.base': 'Volumes must be a number or blank',
        'number.min': 'Volumes must be a positive number',
        'number.unsafe': `Volume entered exceeds the maximum safe number ${Number.MAX_SAFE_INTEGER}`
      })
  )

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
