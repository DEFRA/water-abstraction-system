'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/check` page
 * @module CheckValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {object} session - Session object containing the return submission data
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(session) {
  const abstractionValue = _abstractionValue(session)

  const schema = Joi.object({
    abstractionValue: Joi.number()
      .greater(0)
      .messages({ 'number.greater': 'Returns with an abstraction volume of 0 should be recorded as a nil return.' })
  })

  return schema.validate({ abstractionValue }, { abortEarly: false })
}

/**
 * If the return is reported as abstraction volumes then find the maximum quantity from the lines. If it is reported as
 * meter readings then find the maximum reading from the lines and subtract the start reading to get the total amount
 * abstracted.
 *
 * @private
 */
function _abstractionValue(session) {
  if (session.reported === 'abstraction-volumes') {
    return Math.max(
      ...session.lines.map((line) => {
        return line.quantity || 0
      })
    )
  }

  const maxMeterReading = Math.max(
    ...session.lines.map((line) => {
      return line.reading || 0
    })
  )

  // If any water has been abstracted this will return a positive value
  return maxMeterReading - session.startReading
}

module.exports = {
  go
}
