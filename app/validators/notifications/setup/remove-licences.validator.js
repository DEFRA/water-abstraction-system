'use strict'

/**
 * Validates data submitted for the `/notifications/setup/remove-licences` page
 * @module RemoveLicencesValidator
 */

const Joi = require('joi')

const errorMessage = 'Please enter a licence number'

/**
 * Validates data submitted for the `/notifications/setup/remove-licences` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    removeLicences: Joi.string().required().messages({
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
