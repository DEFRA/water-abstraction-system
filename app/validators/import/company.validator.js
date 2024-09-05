'use strict'

/**
 * @module ImportCompanyValidator
 */

const Joi = require('joi')

/**
 * Checks that the imported company data has been transformed and is valid for persisting to WRLS
 *
 * @param {object} company - The transformed company data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (company) {
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

  const result = schema.validate(company, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
