'use strict'

/**
 * Validates data submitted for the `/notices/setup/returns-period` page
 * @module ReturnsPeriodValidator
 */

const Joi = require('joi')
const { returnPeriodDates } = require('../../../lib/static-lookups.lib.js')

/**
 * Validates data submitted for the `/notices/setup/returns-period` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @param noticeType
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, noticeType) {
  const validValues = Object.keys(returnPeriodDates)

  const errorMessage = `Select the returns periods for the ${noticeType}`

  const schema = Joi.object({
    returnsPeriod: Joi.string()
      .required()
      .valid(...validValues)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
