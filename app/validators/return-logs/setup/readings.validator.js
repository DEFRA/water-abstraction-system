'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module ReadingsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {module:SessionModel} session - The returns log session instance
 * @param {number} requestedYear - The requested year
 * @param {number} requestedMonth - The requested month. This is a zero-indexed month, January is 0 and December is 11
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, session, requestedYear, requestedMonth) {
  const { lines, startReading } = session

  // Convert the payload object into an array of readings e.g. [10, 20, 30]
  const meterReadingsArray = Object.values(payload).map(Number)

  const previousMeterReading = _previousMeterReading(lines, requestedYear, requestedMonth, startReading)

  const schema = Joi.array()
    .items(
      Joi.number().min(0).allow(null).messages({
        'number.base': 'Meter readings must be a number or blank',
        'number.min': 'Meter readings must be a positive number'
      })
    )
    .custom((value, helpers) => {
      // We need to check the values are in increasing order
      return _meterReadingsInIncreasingOrder(value, helpers, previousMeterReading)
    })

  return schema.validate(meterReadingsArray, { abortEarly: false })
}

function _meterReadingsInIncreasingOrder(value, helpers, previousMeterReading) {
  if (value[0] < previousMeterReading) {
    return helpers.message(
      `The meter readings must be greater than or equal to the previous reading of ${previousMeterReading}`
    )
  }

  for (let i = 1; i < value.length; i++) {
    if (value[i] < value[i - 1]) {
      return helpers.message(`Each meter reading must be greater than or equal to the previous reading`)
    }
  }

  return value
}

/**
 * Finds the highest previous meter reading. This will be the Start Reading if no prior meter readings exist
 *
 * @private
 */
function _previousMeterReading(lines, requestedYear, requestedMonth, startReading) {
  const previousLines = lines.filter((line) => {
    const endDate = new Date(line.endDate)

    // Return lines that are prior to the requested year and month
    return (
      (endDate.getFullYear() === requestedYear && endDate.getMonth() < requestedMonth) ||
      endDate.getFullYear() < requestedYear
    )
  })

  const maxReading = Math.max(
    startReading,
    ...previousLines
      .map((previousLine) => previousLine.reading) // Extract the readings
      .filter((reading) => reading != null) // Remove null or undefined readings
  )

  return maxReading
}

module.exports = {
  go
}
