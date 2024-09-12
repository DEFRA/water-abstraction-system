'use strict'

/**
 * @module ImportLicenceHolderValidator
 */

const Joi = require('joi')

/**
 * Checks that the imported licence holder data has been transformed and is valid for persisting to WRLS
 *
 * @param {object} contact - The transformed licence holder data
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (contact) {
  const schema = Joi.object({
    companyExternalId: Joi.string().required(),
    contactExternalId: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.valid(null).required(),
    licenceRoleId: Joi.string().guid().required()
  })

  const result = schema.validate(contact, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
