'use strict'

/**
 * Validates data submitted for the `/users/internal/{id}/edit` page
 *
 * @module EditUserValidator
 */

const Joi = require('joi')

const { userPermissions } = require('../../../lib/static-lookups.lib.js')

const ERROR_MESSAGE = 'Select a valid permission'

/**
 * Validates data submitted for the `/users/internal/{id}/edit` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    permissions: Joi.string()
      .valid(...Object.keys(userPermissions))
      .required()
      .messages({
        'any.required': ERROR_MESSAGE,
        'any.only': ERROR_MESSAGE,
        'string.empty': ERROR_MESSAGE
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
