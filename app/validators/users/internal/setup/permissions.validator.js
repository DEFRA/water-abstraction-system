'use strict'

/**
 * Validates data submitted for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @module PermissionsValidator
 */

const Joi = require('joi')

const { userPermissions } = require('../../../../lib/static-lookups.lib.js')

/**
 * Validates data submitted for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const schema = Joi.object({
    permission: Joi.string()
      .required()
      .valid(...Object.keys(userPermissions))
      .messages({
        'any.required': 'Select a permission',
        'any.only': 'Select a valid permission'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

module.exports = {
  go
}
