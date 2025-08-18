'use strict'

/**
 * Validates data submitted for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @module SelectRecipientsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the '/notices/setup/{sessionId}/select-recipients' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    recipients: Joi.array().required().min(1).messages({
      'any.required': 'Select at least one recipient',
      'array.min': 'Select at least one recipient'
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
