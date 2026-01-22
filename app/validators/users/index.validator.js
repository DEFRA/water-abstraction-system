'use strict'

/**
 * Validates data submitted for the `/users` page
 * @module IndexValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { userPermissions } = require('../../lib/static-lookups.lib.js')

const MAX_EMAIL_LENGTH = 255
const VALID_STATUSES = ['awaiting', 'disabled', 'enabled']
const VALID_TYPES = ['water_admin', 'water_vml']

/**
 * Validates filters submitted for the `/users` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload) {
  const permissions = Object.keys(userPermissions)

  const schema = Joi.object({
    email: Joi.string()
      .max(MAX_EMAIL_LENGTH)
      .optional()
      .messages({
        'string.max': `Email must be ${MAX_EMAIL_LENGTH} characters or less`
      }),
    permissions: Joi.string()
      .optional()
      .valid(...permissions)
      .messages({
        'any.required': 'Select a valid permission',
        'any.only': 'Select a valid permission',
        'string.empty': 'Select a valid permission'
      }),
    status: Joi.string()
      .optional()
      .valid(...VALID_STATUSES)
      .messages({
        'any.required': 'Select a valid status',
        'any.only': 'Select a valid status',
        'string.empty': 'Select a valid status'
      }),
    type: Joi.string()
      .optional()
      .valid(...VALID_TYPES)
      .messages({
        'any.required': 'Select a valid type',
        'any.only': 'Select a valid type',
        'string.empty': 'Select a valid type'
      })
  })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

module.exports = {
  go
}
