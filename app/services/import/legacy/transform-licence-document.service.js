'use strict'

/**
 * Transforms all NALD licence document data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceDocumentService
 */

const FetchLicenceDocumentService = require('./fetch-licence-document.service.js')
const LicenceDocumentPresenter = require('../../../presenters/import/legacy/licence-document.presenter.js')
const LicenceDocumentValidator = require('../../../validators/import/licence-document.validator.js')

/**
 * Transforms all NALD licence document data into an object that matches the WRLS structure
 *
 * NALD does not have a concept of a document it is a legacy WRLS construct
 *
 * After transforming and validating the NALD licence version data, it attaches it to the licence we're importing.
 *
 * @param {string} regionCode - The NALD region code for the licence being imported
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 */
async function go (regionCode, naldLicenceId, transformedLicence) {
  const naldLicenceDocument = await FetchLicenceDocumentService.go(regionCode, naldLicenceId)

  const transformedLicenceDocument = LicenceDocumentPresenter.go(naldLicenceDocument)

  LicenceDocumentValidator.go(transformedLicenceDocument)

  transformedLicence.licenceDocument = transformedLicenceDocument
}

module.exports = {
  go
}
