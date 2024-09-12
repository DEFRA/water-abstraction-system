'use strict'

/**
 * Maps the legacy NALD licence holder data to the WRLS format
 * @module LicenceHolderPresenter
 */

/**
 * Maps the legacy NALD licence holder data to the WRLS format
 *
 * @param {ImportLegacyLicenceHolderType} licenceHolder - the legacy NALD licence holder
 *
 * @returns {object} the NALD licence holder data transformed into the WRLS format for a contact
 * ready for validation and persisting
 */
function go (licenceHolder) {
  return {
    companyExternalId: licenceHolder.company_external_id,
    contactExternalId: licenceHolder.contact_external_id,
    startDate: licenceHolder.start_date,
    endDate: null,
    licenceRoleId: licenceHolder.licence_role_id
  }
}

module.exports = {
  go
}
