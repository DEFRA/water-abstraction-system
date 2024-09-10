'use strict'

/**
 * Maps the legacy NALD contact data to the WRLS format
 * @module ContactPresenter
 */

/**
 * Maps the legacy NALD contact data to the WRLS format
 *
 * @param {ImportLegacyContactType} contact - the legacy NALD contact
 *
 * @returns {object} the NALD contact data transformed into the WRLS format for a contact
 * ready for validation and persisting
 */
function go (contact) {
  return {
    externalId: contact.external_id,
    salutation: contact.salutation,
    initials: contact.initials,
    firstName: contact.first_name,
    lastName: contact.last_name
  }
}

module.exports = {
  go
}
