'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/single-volume` page
 * @module SingleVolumeValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['yes', 'no']

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/single-volume` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  // Don't know the maximum number
  const singleVolumeError = 'Select which units were used'
  const singleVolumeQuantityError = 'Enter a total figure'

  const schema = Joi.object({
    singleVolume: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': singleVolumeError,
        'any.only': singleVolumeError,
        'string.empty': singleVolumeError
      }),
    singleVolumeQuantity: Joi.number()
      .min(0)
      .max(100)
      .when('singleVolume', { is: 'yes', then: Joi.required() })
      .messages({
        'any.required': singleVolumeQuantityError,
        'number.base': singleVolumeQuantityError,
        'number.min': singleVolumeQuantityError,
        'number.max': singleVolumeQuantityError,
        'number.unsafe': singleVolumeQuantityError
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
