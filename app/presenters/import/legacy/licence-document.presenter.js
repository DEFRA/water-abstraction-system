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
function go (licenceDocument) {
  return {
    dateDeleted: null,
    documentRef: licenceDocument.document_ref,
    documentType: 'abstraction_licence',
    endDate: licenceDocument.end_date,
    externalId: licenceDocument.external_id,
    regime: 'water',
    startDate: licenceDocument.start_date
  }
}

module.exports = {
  go
}
