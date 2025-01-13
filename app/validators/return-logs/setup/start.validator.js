'use strict'

/**
 * Validates data submitted for the `/return-log-edit/{sessionId}/start` page
 * @module StartValidator
 */

const Joi = require('joi')

const VALID_VALUES = ['enterReturn', 'nilReturn', 'recordReceipt']

/**
 * Validates data submitted for the `/return-log-edit/{sessionId}/start` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const errorMessage = 'Select what you want to do with this return'

  const schema = Joi.object({
    whatToDo: Joi.string()
      .required()
      .valid(...VALID_VALUES)
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
