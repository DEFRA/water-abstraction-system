'use strict'

/**
 * Validates data submitted for the `/return-logs/{sessionId}/multiple-entries` page
 * @module MultipleEntriesValidator
 */

const Joi = require('joi')

const SplitMultipleEntriesService = require('../../../services/return-logs/setup/split-multiple-entries.service.js')

/**
 * Validates data submitted for the `/return-logs/{sessionId}/multiple-entries` page
 *
 * @param {string} frequency - The reporting frequency of the return (daily/weekly/monthly)
 * @param {number} length - The number of entries the user needs to enter
 * @param {string} measurementType - The type of measurement the entries are (volumes or readings)
 * @param {object} payload - The payload from the request to be validated
 * @param {number} startReading - The start meter reading for the return
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(frequency, length, measurementType, payload, startReading) {
  if (payload.multipleEntries) {
    const formattedEntries = SplitMultipleEntriesService.go(payload.multipleEntries)

    payload.formattedEntries = formattedEntries
  }

  const schema = Joi.array()
    .length(length)
    .items(
      Joi.number()
        .min(0)
        .allow(null)
        .messages({
          'number.base': `${measurementType.charAt(0).toUpperCase() + measurementType.slice(1)} must be a number or x for a blank row`,
          'number.min': `${measurementType.charAt(0).toUpperCase() + measurementType.slice(1)} must be a positive number`
        })
    )
    .custom((value, helpers) => {
      // If the measurement type is meter readings we need to check the values are in increasing order
      if (measurementType === 'meter readings') {
        return _meterReadingsInIncreasingOrder(value, helpers, startReading)
      }

      return value
    })
    .required()
    .messages({
      'array.length': `Enter ${length} ${frequency} ${measurementType}`,
      'any.required': `Enter ${length} ${frequency} ${measurementType}`
    })

  return schema.validate(payload.formattedEntries, { abortEarly: false })
}

function _meterReadingsInIncreasingOrder(value, helpers, startReading) {
  // To make iterating through the meter readings easier we will remove any null values so the values that are left are
  // all valid
  const filteredValues = value.filter((item) => {
    return item !== null
  })

  if (filteredValues[0] < startReading) {
    return helpers.message(`The meter readings must be greater than or equal to the start reading of ${startReading}`)
  }

  for (let i = 0; i < filteredValues.length; i++) {
    if (filteredValues[i] < filteredValues[i - 1]) {
      return helpers.message(`Each meter reading must be greater than or equal to the previous reading`)
    }
  }

  return value
}

module.exports = {
  go
}
