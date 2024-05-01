'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 * @module ReasonValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'change-to-special-agreement',
  'name-or-address-change',
  'transfer-and-now-chargeable',
  'extension-of-licence-validity',
  'major-change',
  'minor-change',
  'new-licence-in-part-succession-or-licence-apportionment',
  'new-licence',
  'new-special-agreement',
  'succession-or-transfer-of-licence',
  'succession-to-remainder-licence-or-licence-apportionment'
]

const errorMessage = 'Select the reason for the requirements for returns'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const schema = Joi.object({
    reason: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
