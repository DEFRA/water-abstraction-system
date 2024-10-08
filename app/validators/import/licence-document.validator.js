'use strict'

/**
 * @module ImportLicenceDocumentValidator
 */

const Joi = require('joi')

/**
 * Checks that imported licence data that has been transformed is valid for persisting to WRLS as a licence document
 *
 * @param {object} licenceDocument - The transformed licence data into a licence document
 *
 * @throws {Joi.ValidationError} - throws a Joi validation error if the validation fails
 */
function go (licenceDocument) {
  const schema = Joi.object({
    documentRef: Joi.string().required(),
    endDate: Joi.date().required().allow(null),
    externalId: Joi.string().required(),
    startDate: Joi.date().required()
  })

  const result = schema.validate(licenceDocument, { convert: false })

  if (result.error) {
    throw result.error
  }
}

module.exports = {
  go
}
