'use strict'

const { generateLicenceRef } = require('../support/helpers/licence.helper.js')

/**
 * Create recipients test data
 *
 * @returns {object} - Returns recipients for
 * primaryUser, returnsAgent, licenceHolder, returnsTo
 * and licenceHolderWithMultipleLicences
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

function _addLicenceHolder() {
  return {
    all_licences: generateLicenceRef(),
    message_type: 'Letter - licence holder',
    contact: {
      name: `Licence Guy`,
      ..._address(),
      role: 'Licence holder'
    },
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

function _addReturnsAgent() {
  return {
    all_licences: generateLicenceRef(),
    contact: null,
    contact_hash_id: -370722837,
    message_type: 'Email - returns agent',
    recipient: 'returns.agent@important.com'
  }
}

function _addReturnTo() {
  return {
    all_licences: generateLicenceRef(),
    message_type: 'Letter - Returns To',
    contact: {
      name: `Returner Guy`,
      ..._address(),
      role: 'Returns to'
    },
    contact_hash_id: 123223
  }
}

function _addLicenceHolderWithMultipleLicences() {
  return {
    all_licences: `${generateLicenceRef()}, ${generateLicenceRef()}`,
    message_type: 'Letter - licence holder',
    contact: {
      name: `Multiple Licence Guy`,
      ..._address(),
      role: 'Licence holder'
    },
    contact_hash_id: -167278576
  }
}

function _address(index) {
  return {
    addressLine1: `${index}`,
    addressLine2: 'Privet Drive',
    addressLine3: null,
    addressLine4: null,
    country: null,
    county: 'Surrey',
    forename: 'Harry',
    initials: 'J',
    postcode: 'WD25 7LR',
    salutation: null,
    town: 'Little Whinging',
    type: 'Person'
  }
}

module.exports = {
  recipients
}
