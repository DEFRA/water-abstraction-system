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

  const previousHighestReading = _previousHighestReading(lines, requestedYear, requestedMonth, startReading)
  const subsequentLowestReading = _subsequentLowestReading(lines, requestedYear, requestedMonth)

  const schema = Joi.object().pattern(
    /^reading-\d+$/, // Regex to match keys like 'reading-1', 'reading-3', etc.
    Joi.number()
      .min(0)
      .custom((value, helpers) => {
        // We need to check the values are in increasing order
        return _meterReadingsInIncreasingOrder(value, helpers, payload, previousHighestReading, subsequentLowestReading)
      })
      .messages({
        'number.base': 'Meter readings must be a number or blank',
        'number.min': 'Meter readings must be a positive number'
      })
  )

  return schema.validate(payload, { abortEarly: false })
}

function _meterReadingsInIncreasingOrder(value, helpers, payload, previousHighestReading, subsequentLowestReading) {
  const key = helpers.state.path[0] // Get the current key being validated

  // Convert the payload into an array e.g. [{ key: 'reading-0', reading: 10 }, { key: 'reading-2', reading: 30 }]
  const meterReadingsArray = Object.entries(payload).map(([key, reading]) => {
    return {
      key,
      reading: Number(reading)
    }
  })

  const currentKeyIndex = meterReadingsArray.findIndex((item) => {
    return item.key === key
  })

  if (value < previousHighestReading) {
    return helpers.message(
      `The meter readings must be greater than or equal to the previous reading of ${previousHighestReading}`
    )
  }

  if (value > subsequentLowestReading) {
    return helpers.message(
      `The meter readings must be less than or equal to the subsequent reading of ${subsequentLowestReading}`
    )
  }

  if (currentKeyIndex > 0) {
    if (value < meterReadingsArray[currentKeyIndex - 1].reading) {
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
function _previousHighestReading(lines, requestedYear, requestedMonth, startReading) {
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
      .map((previousLine) => {
        return previousLine.reading // Extract the readings
      })
      .filter((reading) => {
        return reading != null // Remove null or undefined readings
      })
  )

  return maxReading
}

/**
 * Finds the lowest subsequent meter reading. This will be the MAX_SAFE_INTEGER if no subsequent meter readings exist
 *
 * @private
 */
function _subsequentLowestReading(lines, requestedYear, requestedMonth) {
  const subsequentLines = lines.filter((line) => {
    const endDate = new Date(line.endDate)

    // Return lines that are after the requested year and month
    return (
      (endDate.getFullYear() === requestedYear && endDate.getMonth() > requestedMonth) ||
      endDate.getFullYear() > requestedYear
    )
  })

  const minReading = Math.min(
    Number.MAX_SAFE_INTEGER,
    ...subsequentLines
      .map((previousLine) => {
        return previousLine.reading // Extract the readings
      })
      .filter((reading) => {
        return reading != null // Remove null or undefined readings
      })
  )

  return minReading
}

module.exports = {
  go
}
