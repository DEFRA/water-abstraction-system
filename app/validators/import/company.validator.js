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
    externalId: Joi.string().required(),
    addresses: Joi.array().required(),
    companyAddresses: Joi.array().required()
  })

  const result = schema.validate(company, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
