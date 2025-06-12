'use strict'

const { generateLicenceRef } = require('../support/helpers/licence.helper.js')

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
    licence_refs: generateLicenceRef(),
    contact: null,
    contact_hash_id: '90129f6aa5b98734aa3fefd3f8cf86a',
    contact_type: 'Additional contact',
    email: 'additional.contact@important.com'
  }
}

/**
 * Create duplicate by contact hash recipients
 *
 * @returns {object} - Returns duplicate contact hash recipients
 */
function duplicateRecipients() {
  const duplicateLicenceRef = generateLicenceRef()
  const licenceDuplicateLicenceRef = generateLicenceRef()

  return {
    duplicateLicenceHolder: _addDuplicateLicenceHolder(licenceDuplicateLicenceRef),
    duplicateReturnsTo: _addDuplicateReturnsTo(licenceDuplicateLicenceRef),
    duplicatePrimaryUser: _addDuplicatePrimaryUser(duplicateLicenceRef),
    duplicateReturnsAgent: _addDuplicateReturnsAgent(duplicateLicenceRef)
  }
}

function _addDuplicateLicenceHolder(licenceRef) {
  return {
    licence_refs: licenceRef,
    contact_type: 'Licence holder',
    contact: _contact('4', 'Duplicate Licence holder', 'Licence holder'),
    contact_hash_id: 'b1b355491c7d42778890c545e08797ea'
  }
}

function _addDuplicateReturnsTo(licenceRef) {
  return {
    licence_refs: licenceRef,
    contact_type: 'Returns to',
    contact: _contact('4', 'Duplicate Returns to', 'Returns to'),
    contact_hash_id: 'b1b355491c7d42778890c545e08797ea'
  }
}

function _addLicenceHolder() {
  return {
    licence_refs: generateLicenceRef(),
    contact_type: 'Licence holder',
    contact: _contact('1', 'Licence holder', 'Licence holder'),
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214'
  }
}

function _addPrimaryUser() {
  return {
    licence_refs: generateLicenceRef(),
    contact: null,
    contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
    contact_type: 'Primary user',
    email: 'primary.user@important.com'
  }
}

function _addDuplicatePrimaryUser(licenceRef) {
  return {
    licence_refs: licenceRef,
    contact: null,
    contact_hash_id: '2e6918568dfbc1d78e2fbe279fftt990',
    contact_type: 'Primary user',
    email: 'primary.user@important.com'
  }
}

function _addReturnsAgent() {
  return {
    licence_refs: generateLicenceRef(),
    contact: null,
    contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
    contact_type: 'Returns agent',
    email: 'returns.agent@important.com'
  }
}

function _addDuplicateReturnsAgent(licenceRef) {
  return {
    licence_refs: licenceRef,
    contact: null,
    contact_hash_id: '2e6918568dfbc1d78e2fbe279fftt990',
    contact_type: 'Returns agent',
    email: 'returns.agent@important.com'
  }
}

function _addReturnTo() {
  return {
    licence_refs: generateLicenceRef(),
    contact_type: 'Returns to',
    contact: _contact('2', 'Returns to', 'Returns to'),
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed679893'
  }
}

function _addLicenceHolderWithMultipleLicences() {
  return {
    licence_refs: `${generateLicenceRef()},${generateLicenceRef()}`,
    contact_type: 'Licence holder',
    contact: _contact('3', 'Licence holder with multiple licences', 'Licence holder'),
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed09878075'
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
  recipients,
  duplicateRecipients
}
