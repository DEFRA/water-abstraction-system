'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/meter-details` page
 * @module MeterDetailsValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['yes', 'no']

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/meter-details` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    meterMake: Joi.string().required().max(310).messages({
      'any.required': 'Enter the make of the meter',
      'string.max': 'Make must be 310 characters or less'
    }),
    meterSerialNumber: Joi.string().required().max(180).messages({
      'any.required': 'Enter a serial number',
      'string.max': 'Serial number must be 180 characters or less'
    }),
    meter10TimesDisplay: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select if the meter has a ×10 display',
        'any.only': 'Select if the meter has a ×10 display',
        'string.empty': 'Select if the meter has a ×10 display'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
