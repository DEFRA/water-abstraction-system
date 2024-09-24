'use strict'

/**
 * @module ImportContactValidator
 */

const Joi = require('joi')

/**
 * Checks that the imported contact data has been transformed and is valid for persisting to WRLS
 *
 * @param {object} contact - The transformed contact data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (contact) {
  const schema = Joi.object({
    salutation: Joi.string().allow(null),
    initials: Joi.string().allow(null),
    firstName: Joi.string().allow(null),
    lastName: Joi.string().allow(null),
    externalId: Joi.string().required()
  })

  const result = schema.validate(contact, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
