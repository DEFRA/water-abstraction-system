'use strict'

/**
 * Create recipients test data
 *
 * @returns {object[]}
 */
function recipients() {
  const recipients = []

  for (let index = 0; index < 30; index++) {
    recipients.push(_recipients(index))
  }

  return recipients
}

function _recipients(index) {
  return {
    all_licences: `01/1234/${index}`,
    message_type: 'Letter - licence holder',
    recipient: null,
    contact: {
      name: `Harry ${index}`,
      role: 'Licence holder',
      ..._address()
    },
    contact_hash_id: 185890350 + index
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
