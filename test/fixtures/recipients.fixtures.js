'use strict'

const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * Create abstraction alerts recipients test data
 *
 * @returns {object} - Returns recipients for primaryUser, licenceHolder and additional contact
 */
function alertsRecipients() {
  return {
    additionalContact: _addAdditionalContact(),
    licenceHolder: _addLicenceHolder(),
    primaryUser: _addPrimaryUser()
  }
}

/**
 * Create recipients test data
 *
 * @returns {object} - Returns recipients for primaryUser, returnsAgent, licenceHolder, returnsTo and
 * licenceHolderWithMultipleLicences
 */
function recipients() {
  return {
    primaryUser: _addPrimaryUser(),
    returnsAgent: _addReturnsAgent(),
    licenceHolder: _addLicenceHolder(),
    returnsTo: _addReturnTo(),
    licenceHolderWithMultipleLicences: _addLicenceHolderWithMultipleLicences()
  }
}

// an additional contact will always be associated with a primary user or licence holder by the licence ref
function _addAdditionalContact() {
  return {
    licence_refs: [generateLicenceRef()],
    contact: null,
    contact_hash_id: '90129f6aa5b98734aa3fefd3f8cf86a',
    contact_type: 'Additional contact',
    email: 'additional.contact@important.com',
    message_type: 'Email'
  }
}

function _addLicenceHolder() {
  return {
    contact: _contact('1', 'Potter', 'Licence holder'),
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
    contact_type: 'Licence holder',
    email: null,
    licence_refs: [generateLicenceRef()],
    message_type: 'Letter',
    return_log_ids: [generateUUID()]
  }
}

function _addPrimaryUser() {
  return {
    licence_refs: [generateLicenceRef()],
    contact: null,
    contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
    contact_type: 'Primary user',
    email: 'primary.user@important.com',
    return_log_ids: [generateUUID()],
    message_type: 'Email'
  }
}

function _addReturnsAgent() {
  return {
    licence_refs: [generateLicenceRef()],
    contact: null,
    contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
    contact_type: 'Returns agent',
    email: 'returns.agent@important.com',
    return_log_ids: [generateUUID()],
    message_type: 'Email'
  }
}

function _addReturnTo() {
  // NOTE: By removing the postcode from this one contact, we know we'll get a recipient that when passed to the
  // presenters will result in the address being flagged as INVALID. This allows us to write tests for this scenario.
  const contact = _contact('2', 'Weasley', 'Returns to')

  contact.postcode = null

  return {
    contact,
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed679893',
    contact_type: 'Returns to',
    email: null,
    licence_refs: [generateLicenceRef()],
    message_type: 'Letter',
    return_log_ids: [generateUUID()]
  }
}

function _addLicenceHolderWithMultipleLicences() {
  return {
    contact: _contact('3', 'Potter', 'Licence holder'),
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed09878075',
    contact_type: 'Licence holder',
    email: null,
    licence_refs: [generateLicenceRef(), generateLicenceRef()],
    message_type: 'Letter',
    return_log_ids: [generateUUID()]
  }
}

/**
 * The fetch query handles duplicates by grouping them by a contact hash.
 *
 * This hash is unique to the contact address. For ease of testing, we are only incrementing the street number
 * and not using various addresses as we are only concerned with the contact hash ID to dedupe.
 *
 * @param line1 - the unique contract address
 * @returns {string} - a unique address
 * @private
 */
function _contact(line1, name, role) {
  return {
    addressLine1: `${line1}`,
    addressLine2: 'Privet Drive',
    addressLine3: null,
    addressLine4: null,
    country: null,
    county: 'Surrey',
    forename: 'Harry',
    initials: 'H J',
    name,
    postcode: 'WD25 7LR',
    role,
    salutation: 'Mr',
    town: 'Little Whinging',
    type: 'Person'
  }
}

module.exports = {
  alertsRecipients,
  recipients
}
