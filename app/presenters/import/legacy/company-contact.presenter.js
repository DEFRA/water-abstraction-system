'use strict'

/**
 * Maps the legacy NALD company contact data to the WRLS format
 * @module CompanyContactPresenter
 */

/**
 * Maps the legacy NALD licence holder data to the WRLS format
 *
 * @param {ImportLegacyContactType} contact - the legacy NALD contact
 *
 * @returns {object} the NALD licence holder data transformed into the WRLS format for a company contact
 * ready for validation and persisting
 */
function go (contact) {
  return {
    externalId: contact.external_id,
    startDate: contact.start_date,
    licenceRoleId: contact.licence_role_id
  }
}

module.exports = {
  go
}
