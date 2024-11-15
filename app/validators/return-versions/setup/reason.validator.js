'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 * @module ReasonValidator
 */

const Joi = require('joi')

const { returnRequirementReasons } = require('../../../lib/static-lookups.lib.js')

const errorMessage = 'Select the reason for the requirements for returns'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 *
 * @param {object} data - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const validValues = Object.keys(returnRequirementReasons)

  const schema = Joi.object({
    reason: Joi.string()
      .required()
      .valid(...validValues)
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
