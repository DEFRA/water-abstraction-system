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
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go (payload) {
  // NOTE: When a single point is checked by a user, it returns as a string. When multiple points are checked, the
  // 'payload' is returned as an array. To make Joi validation straightforward, if the 'payload.points' is a string, it
  // is turned into an array and validated as such.
  let points = payload.points

  if (!Array.isArray(points)) {
    points = [points]
  }

  const errorMessage = 'Select any points for the requirements for returns'

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
