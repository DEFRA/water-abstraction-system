'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/points` page
 * @module PointsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/points` page
 *
 * When setting up a requirement users must specify a points for the return requirement.
 * Users must select one or more points linked to the licence. If these requirements are not met
 * the validation will return an error.
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} The result from calling Joi's schema.validate(). If any errors are found the
 * `error:` property will also exist detailing what the issue is.
 */
function go (payload) {
  let points = payload.points

  if (!Array.isArray(points)) {
    points = [points]
  }

  const errorMessage = 'Select any points for the return requirement'

  const schema = Joi.object({
    points: Joi.array()
      .items(Joi.string())
      .required()
  }).messages({
    'any.required': errorMessage,
    'array.sparse': errorMessage
  })

  return schema.validate({ points }, { abortEarly: false })
}

module.exports = {
  go
}
