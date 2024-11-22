'use strict'

/**
 * Maps legacy NALD licence data to the WRLS licence document role format
 * @module LicenceDocumentRolePresenter
 */

/**
 * Maps legacy NALD licence data to the WRLS licence document role format
 *
 * @param {ImportLegacyLicenceDocumentRoleType} licenceDocumentRole - the legacy NALD licence
 * @param {string} licenceRef - the licence ref for the licence document
 *
 * @returns {object} the NALD licence data transformed into the WRLS licence document role format
 * ready for validation and persisting
 */
function go(licenceDocumentRole, licenceRef) {
  return {
    addressId: licenceDocumentRole.address_id,
    companyId: licenceDocumentRole.company_id,
    contactId: licenceDocumentRole.contact_id,
    documentId: licenceRef,
    endDate: licenceDocumentRole.end_date,
    licenceRoleId: licenceDocumentRole.licence_role_id,
    startDate: licenceDocumentRole.start_date
  }
}

module.exports = {
  go
}
