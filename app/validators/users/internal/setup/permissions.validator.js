/**
 * Validates data submitted for the '/users/internal/setup/{sessionId}/permissions' page
 *
 * @module PermissionsValidator
 */

import Joi from 'joi'

import { userPermissions } from '../../../../lib/static-lookups.lib.js'

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
        'any.required': 'Select permissions for the user',
        'any.only': 'Select valid permissions for the user'
      })
  })

  return schema.validate(payload, { abortEarly: false })
}

export default {
  go
}
