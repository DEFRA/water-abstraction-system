'use strict'

/**
 * @module ImportCompanyValidator
 */

const Joi = require('joi')

/**
 * Checks that imported company data that has been transformed is valid for persisting to WRLS
 *
 * @param {object} licence - The transformed licence data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licence) {
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('organisation', 'person').required(),
    externalId: Joi.string()
      .pattern(/^\d:\d+$/) // One digit, colon, and one or more digits ('1:234')
      .required()
      .messages({
        'string.pattern.base': '"externalId" must be in the format X:YYYY, where X is a single digit and YYYY are digits.'
      })
  })

  const result = schema.validate(licence, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
