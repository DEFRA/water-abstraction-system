'use strict'

/**
 * Transforms all NALD licence document role data into an object that matches the WRLS structure
 * @module ImportLegacyTransformLicenceDocumentRolesService
 */

const FetchLicenceDocumentRolesService = require('./fetch-licence-document-roles.service.js')
const ImportLicenceDocumentRoleValidator = require('../../../validators/import/licence-document-role.validator.js')
const LicenceDocumentRolePresenter = require('../../../presenters/import/legacy/licence-document-role.presenter.js')

/**
 * Transforms all NALD licence document roles data into an object that matches the WRLS structure
 *
 * NALD does not have a concept of a document it is a legacy WRLS construct
 *
 * @param {string} regionCode - The NALD region code for the licence being imported
 * @param {string} naldLicenceId - The NALD ID for the licence being imported
 * @param {object} transformedLicence - An object representing a valid WRLS licence
 * @param licenceRef
 */
async function go (regionCode, naldLicenceId, transformedLicence, licenceRef) {
  const naldLicenceDocumentRoles = await FetchLicenceDocumentRolesService.go(regionCode, naldLicenceId)

  for (const licenceDocumentRole of naldLicenceDocumentRoles) {
    const transformedLicenceDocumentRole = LicenceDocumentRolePresenter.go(licenceDocumentRole, licenceRef)

    ImportLicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)

    transformedLicence.licenceDocumentRoles.push(transformedLicenceDocumentRole)
  }
}

module.exports = {
  go
}
