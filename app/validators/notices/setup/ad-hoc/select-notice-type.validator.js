'use strict'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/ad-hoc/select-notice-type` page
 *
 * @module SelectNoticeTypeValidator
 */

const Joi = require('joi')

const errorMessage = 'Select the notice type'

/**
 * Validates data submitted for the `/notices/setup/{sessionId}/ad-hoc/select-notice-type` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    type: Joi.required().messages({
      'any.required': errorMessage
    })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
