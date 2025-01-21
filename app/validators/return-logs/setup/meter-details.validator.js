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
  console.log('🚀  payload:', payload)
  // {meterDetailsMake: 'a', meterDetailsSerialNumber: 'a', meterDetails10TimesDisplay: 'yes'}
  const { meterDetailsMake, meterDetailsSerialNumber, meterDetails10TimesDisplay } = payload

  const result = {
    meterDetailsMakeResult: _validateMeterDetailsMake(meterDetailsMake),
    meterDetailsSerialNumberResult: _validateMeterDetailsSerialNumber(meterDetailsSerialNumber),
    meterDetails10TimesDisplayResult: _validateMeterDetails10TimesDisplay(meterDetails10TimesDisplay)
  }

  console.log('🚀  result:', result)

  return result
}

function _validateMeterDetailsSerialNumber(meterDetailsSerialNumber) {
  const errorMessage = {
    empty: 'Enter a serial number',
    big: 'Serial number must be 180 characters or less'
  }

  const schema = Joi.object({
    meterDetailsSerialNumber: Joi.string().required().max(310).messages({
      'any.required': errorMessage.empty,
      'string.max': errorMessage.big
    })
  })

  return schema.validate({ meterDetailsSerialNumber }, { abortEarly: false })
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

module.exports = {
  go
}

// Validation
// Both make and serial number must be entered
// 10 times display must be selected yes or no (cannot be left blank)
// Make has a character limit of 310
// Longest 304

// Serial number has a character limit of 180
// Longest 176

// Hi can I please just confirm for ticket 4809 the validation. Ive got both make and serial number must be entered. The longest make recorded in the DB is 304 characters, so a maximum character length of 310 for this (just a guess?). The longest serial in the DB recorded at 176, so a maximum character length of 180 for this (just a guess?). The 10 times display must be selected yes or no (cannot be left blank).
