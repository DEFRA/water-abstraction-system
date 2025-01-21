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
  const { meterDetailsMake, meterDetailsSerialNumber, meterDetails10TimesDisplay } = payload

  const result = {
    meterDetailsMakeResult: _validateMeterDetailsMake(meterDetailsMake),
    meterDetailsSerialNumberResult: _validateMeterDetailsSerialNumber(meterDetailsSerialNumber),
    meterDetails10TimesDisplayResult: _validateMeterDetails10TimesDisplay(meterDetails10TimesDisplay)
  }

  return result
}

function _validateMeterDetails10TimesDisplay(meterDetails10TimesDisplay) {
  const errorMessage = 'Select if the meter has a ×10 display'

  const schema = Joi.object({
    meterDetails10TimesDisplay: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate({ meterDetails10TimesDisplay }, { abortEarly: false })
}

function _validateMeterDetailsMake(meterDetailsMake) {
  const errorMessage = {
    empty: 'Enter the make of the meter',
    big: 'Make must be 310 characters or less'
  }

  const schema = Joi.object({
    meterDetailsMake: Joi.string().required().max(310).messages({
      'any.required': errorMessage.empty,
      'string.max': errorMessage.big
    })
  })

  return schema.validate({ meterDetailsMake }, { abortEarly: false })
}

function _validateMeterDetailsSerialNumber(meterDetailsSerialNumber) {
  const errorMessage = {
    empty: 'Enter a serial number',
    big: 'Serial number must be 180 characters or less'
  }

  const schema = Joi.object({
    meterDetailsSerialNumber: Joi.string().required().max(180).messages({
      'any.required': errorMessage.empty,
      'string.max': errorMessage.big
    })
  })

  return schema.validate({ meterDetailsSerialNumber }, { abortEarly: false })
}

module.exports = {
  go
}
