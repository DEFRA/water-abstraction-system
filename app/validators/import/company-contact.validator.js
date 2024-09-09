'use strict'

/**
 * @module ImportCompanyContactValidator
 */

const Joi = require('joi')

/**
 * Checks that the imported company contact data has been transformed and is valid for persisting to WRLS
 *
 * @param {object} company - The transformed company contact data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (company) {
  const schema = Joi.object({
    salutation: Joi.string().allow(null),
    initials: Joi.string().allow(null),
    firstName: Joi.string().allow(null),
    lastName: Joi.string().allow(null),
    externalId: Joi.string().required()
  })

  const result = schema.validate(company, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
