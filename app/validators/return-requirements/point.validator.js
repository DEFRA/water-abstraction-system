'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/points` page
 * @module PointsValidator
 */

const Joi = require('joi')

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
