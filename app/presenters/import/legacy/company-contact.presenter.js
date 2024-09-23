'use strict'

/**
 * Creates a company contact in the WRLS format
 * @module CompanyContactPresenter
 */

/**
 * Creates a company contact in the WRLS format
 *
 * NALD does not have the concept of a compnay contact it is a WRLS construct.
 *
 * A company contact is the join/ link between the NALD contacts and companies.
 *
 * @param {ImportLegacyContactType} contact - the legacy NALD contact
 *
 * @returns {object} the company contact required to create and to persit the company contact to wrls
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
