'use strict'

/**
 * @module ImportAddressValidator
 */

const Joi = require('joi')

/**
 * Checks that the imported address data has been transformed and is valid for persisting to WRLS
 *
 * @param {object} address - The transformed address data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (address) {
  const schema = Joi.object({
    address1: Joi.string().required(),
    address2: Joi.string().allow(null),
    address3: Joi.string().allow(null),
    address4: Joi.string().allow(null),
    address5: Joi.string().allow(null),
    address6: Joi.string().allow(null),
    country: Joi.string().allow(null),
    externalId: Joi.string().required(),
    postcode: Joi.string().allow(null),
    dataSource: Joi.string().required()
  })

  const result = schema.validate(address, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
