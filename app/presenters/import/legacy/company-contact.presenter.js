'use strict'

/**
 * Maps the legacy NALD company contact data to the WRLS format
 * @module CompanyContactPresenter
 */

/**
 * Maps the legacy NALD company contact data to the WRLS format
 *
 * @param {ImportLegacyCompanyContactType} contact - the legacy NALD company contact
 *
 * @returns {object} the NALD company contact data transformed into the WRLS format for a company contact
 * ready for validation and persisting
 */
function go (contact) {
  return {
    externalId: contact.external_id,
    salutation: contact.salutation,
    initials: contact.initials,
    firstName: contact.firstName,
    lastName: contact.lastName
  }
}

module.exports = {
  go
}
