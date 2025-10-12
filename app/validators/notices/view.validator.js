'use strict'

/**
 * Validates filter data submitted for the `/notice/{id}` page
 * @module ViewValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const STATUSES = ['cancelled', 'error', 'pending', 'returned', 'sent']

const MAX_LICENCE_LENGTH = 11
const MAX_RECIPIENT_LENGTH = 25

/**
 * Validates filter data submitted for the `/notice/{id}` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  return _validate(payload)
}

function _validate(payload) {
  const schema = Joi.object({
    status: Joi.string()
      .valid(...STATUSES)
      .optional()
      .messages({
        'any.only': 'Select a valid status type'
      }),
    licence: Joi.string()
      .max(MAX_LICENCE_LENGTH)
      .optional()
      .messages({
        'string.max': `Licence number must be ${MAX_LICENCE_LENGTH} characters or less`
      }),
    recipient: Joi.string()
      .max(MAX_RECIPIENT_LENGTH)
      .optional()
      .messages({
        'string.max': `Recipient must be ${MAX_RECIPIENT_LENGTH} characters or less`
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
