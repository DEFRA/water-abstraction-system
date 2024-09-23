'use strict'

/**
 * Creates a company contact in the WRLS format
 * @module CompanyContactPresenter
 */

/**
 * Creates a company contact in the WRLS format
 *
 * NALD does not have the concept of a 'company contact'. It is a WRLS construct only.
 *
 * If the NALD party is of type 'PERS', WRLS on import splits it into a 'company' and 'contact' record. The
 * 'company-contact' record is the thing that links then together in WRLS.
 *
 * @param {ImportLegacyContactType} contact - the legacy NALD contact derived from the 'party'
 *
 * @returns {object} the details needed to persist the company contact in WRLS
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
