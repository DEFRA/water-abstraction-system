'use strict'

const { generateLicenceRef } = require('../support/helpers/licence.helper.js')

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

/**
 * Create duplicate by contact hash recipients
 *
 * @returns {object} - Returns duplicate contact hash recipients
 */
function duplicateRecipients() {
  const duplicateLicenceRef = generateLicenceRef()
  return {
    duplicateLicenceHolder: _addDuplicateLicenceHolder(duplicateLicenceRef),
    duplicateReturnsTo: _addDuplicateReturnsTo(duplicateLicenceRef),
    duplicatePrimaryUser: _addDuplicatePrimaryUser(duplicateLicenceRef),
    duplicateReturnsAgent: _addDuplicateReturnsAgent(duplicateLicenceRef)
  }
}

/**
 *
 */
function duplicateContactWithDifferentType() {
  return {
    duplicateContactOrganisationType: _addDuplicaateContactType('Organisation'),
    duplicateContactPersonType: _addDuplicaateContactType('Person')
  }
}

function _addDuplicateLicenceHolder(licenceRef) {
  return {
    all_licences: licenceRef,
    message_type: 'Letter - licence holder',
    contact: _contact('4', 'Duplicate Returns to', 'Returns to'),
    contact_hash_id: 167278556784
  }
}

function _addDuplicateReturnsTo(licenceRef) {
  return {
    all_licences: licenceRef,
    message_type: 'Letter - Returns To',
    contact: _contact('4', 'Duplicate Returns to', 'Returns to'),
    contact_hash_id: 167278556784
  }
}

function _addLicenceHolder() {
  return {
    all_licences: generateLicenceRef(),
    message_type: 'Letter - licence holder',
    contact: _contact('1', 'Licence holder', 'Licence holder'),
    contact_hash_id: -1672785580
  }
}

function _addDuplicaateContactType(type) {
  const contact = _contact('5', 'Duplicate contact type', 'Licence holder')

  return {
    all_licences: generateLicenceRef(),
    message_type: 'Letter - licence holder',
    contact: {
      ...contact,
      type
    },
    contact_hash_id: 1234756
  }
}

function _addPrimaryUser() {
  return {
    all_licences: generateLicenceRef(),
    contact: null,
    contact_hash_id: 1178136542,
    message_type: 'Email - primary user',
    recipient: 'primary.user@important.com'
  }
}

function _addDuplicatePrimaryUser(licenceRef) {
  return {
    all_licences: licenceRef,
    contact: null,
    contact_hash_id: 14567627,
    message_type: 'Email - primary user',
    recipient: 'primary.user@important.com'
  }
}

function _addReturnsAgent() {
  return {
    all_licences: generateLicenceRef(),
    contact: null,
    contact_hash_id: -370722837,
    message_type: 'Email - returns agent',
    recipient: 'returns.agent@important.com'
  }
}

function _addDuplicateReturnsAgent(licenceRef) {
  return {
    all_licences: licenceRef,
    contact: null,
    contact_hash_id: 14567627,
    message_type: 'Email - returns agent',
    recipient: 'returns.agent@important.com'
  }
}

function _addReturnTo() {
  return {
    all_licences: generateLicenceRef(),
    message_type: 'Letter - Returns To',
    contact: _contact('2', 'Returns to', 'Returns to'),
    contact_hash_id: 123223
  }
}

function _addLicenceHolderWithMultipleLicences() {
  return {
    all_licences: `${generateLicenceRef()}, ${generateLicenceRef()}`,
    message_type: 'Letter - licence holder',
    contact: _contact('3', 'Licence holder with multiple licences', 'Licence holder'),
    contact_hash_id: -167278576
  }
}

/**
 * The fetch query handles duplicates by grouping them by a contact hash.
 *
 * This hash is unique to the contact address.
 *
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
  duplicateContactWithDifferentType,
  duplicateRecipients,
  recipients
}
