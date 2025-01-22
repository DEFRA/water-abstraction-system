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

function _addDuplicateLicenceHolder(licenceRef) {
  return {
    all_licences: licenceRef,
    message_type: 'Letter - licence holder',
    contact: _contact('4'),
    contact_hash_id: 167278556784
  }
}

function _addDuplicateReturnsTo(licenceRef) {
  return {
    all_licences: licenceRef,
    message_type: 'Letter - Returns To',
    contact: _contact('4'),
    contact_hash_id: 167278556784
  }
}

function _addLicenceHolder() {
  return {
    all_licences: generateLicenceRef(),
    message_type: 'Letter - licence holder',
    contact: _contact('1'),
    contact_hash_id: -1672785580
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
    contact: _contact('2'),
    contact_hash_id: 123223
  }
}

function _addLicenceHolderWithMultipleLicences() {
  return {
    all_licences: `${generateLicenceRef()}, ${generateLicenceRef()}`,
    message_type: 'Letter - licence holder',
    contact: _contact('3'),
    contact_hash_id: -167278576
  }
}

/**
 * The fetch query handles duplicates by grouping them by a contact hash.
 *
 * This hash in unique to the contacts address. For the ease of testing we are only incrementing the street number
 * and not using various addresses as we are only concerned with the contact hash id to dedupe.
 *
 * @param line1 - the unique contract address
 * @returns {string} - a unique address
 * @private
 */
function _contact(line1) {
  return `harry,j,potter,${line1},privet drive,little whinging,surrey,wd25 7lr`
}

module.exports = {
  recipients,
  duplicateRecipients
}
