'use strict'

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/check` page
 * @module CheckValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-logs/setup/{sessionId}/check` page
 *
 * If all return lines are blank (i.e. no quantities or readings have been entered) then an error is returned.
 *
 * @param {object} session - Session object containing the return submission data
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(session) {
  const lineValuesExist = _lineValuesExist(session)

  const schema = Joi.valid(true).messages({ 'any.only': 'At least one return line must contain a value.' })

  return schema.validate(lineValuesExist, { abortEarly: false })
}

function _lineValuesExist(session) {
  if (session.reported === 'abstractionVolumes') {
    return session.lines.some((line) => {
      return typeof line.quantity === 'number'
    })
  }

  return session.lines.some((line) => {
    return typeof line.reading === 'number'
  })
}

module.exports = {
  go
}
