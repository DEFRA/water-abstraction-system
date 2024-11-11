'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/points` page
 * @module PointsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/points` page
 *
 * When setting up a requirement users must specify points for the return requirement. Users must select one or more
 * points linked to the licence. If these requirements are not met the validation will return an error.
 *
 * @param {object} payload - The selected points (if entered) from the payload
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go (payload) {
  const errorMessage = 'Select any points for the requirements for returns'

  const schema = Joi.object({
    points: Joi.array().items(Joi.string().guid()).required()
  }).messages({
    'any.required': errorMessage,
    'array.sparse': errorMessage,
    'string.base': errorMessage,
    'string.guid': errorMessage
  })

  return schema.validate({ points: payload }, { abortEarly: false })
}

module.exports = {
  go
}
