'use strict'

/**
 * Maps legacy NALD licence data to the WRLS licence document format
 * @module LicenceDocumentPresenter
 */

/**
 * Maps legacy NALD licence data to the WRLS licence document format
 *
 * @param {ImportLegacyLicenceDocumentType} licenceDocument - the legacy NALD licence
 *
 * @returns {object} the NALD licence data transformed into the WRLS licence document format
 * ready for validation and persisting
 */
function go(licenceDocument) {
  return {
    // Add an empty array property ready for when transforming and attaching licence document roles
    licenceDocumentRoles: [],
    licenceRef: licenceDocument.licence_ref,
    endDate: licenceDocument.end_date,
    startDate: licenceDocument.start_date
  }
}

module.exports = {
  go
}
