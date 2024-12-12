'use strict'

/**
 * @module ImportLicenceDocumentRoleValidator
 */

const Joi = require('joi')

/**
 * Checks that imported licence data that has been transformed is valid for persisting to WRLS
 * as a licence document role
 *
 * @param {object} licenceDocumentRole - The transformed licence data into a licence document role
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go(licenceDocumentRole) {
  const schema = Joi.object({
    addressId: Joi.string().required(),
    companyId: Joi.string().required(),
    contactId: Joi.string().allow(null),
    documentId: Joi.string().required(),
    endDate: Joi.date().required().allow(null),
    licenceRoleId: Joi.string().guid().required(),
    startDate: Joi.date().required()
  })

  const result = schema.validate(licenceDocumentRole, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
