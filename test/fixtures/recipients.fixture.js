'use strict'

/**
 * Create recipients test data
 *
 * @returns {object[]}
 */
function recipients() {
  const recipients = []

  for (let index = 0; index < 29; index++) {
    recipients.push(_recipients(index))
  }

  recipients.splice(1, 0, _addReturnTo(recipients))
  return recipients
}

function _addReturnTo(recipients) {
  return {
    ...recipients[0],
    message_type: 'Letter - Returns To',
    contact: { ...recipients[0].contact, role: 'Returns to' }
  }
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
