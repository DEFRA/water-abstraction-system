'use strict'

/**
 * Validates data submitted for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @module RecipientNameValidator
 */

const Joi = require('joi')

const errorMessage = `Enter the recipient's name`

/**
 * Validates data submitted for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    name: Joi.string().required()
  }).messages({
    'any.required': errorMessage
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
