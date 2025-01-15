'use strict'

/**
 * @module RecipientsSeeder
 */

const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const ReturnLogHelper = require('../helpers/return-log.helper.js')

/**
 * Adds licence document header and return log records to the database which are linked by licence ref
 *
 * @returns {object[]} - an array of the added licenceDocumentHeaders
 */
async function seed() {
  return [await _addLicenceHolder(), await _addLicenceHolderAndReturnToSameRef()]
}

async function _addLicenceHolder() {
  const name = 'Licence holder only'
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    metadata: {
      ..._metadata(name),
      contacts: [_contact(name, 'Licence holder')]
    }
  })

  await ReturnLogHelper.add({
    licenceRef: licenceDocumentHeader.licenceRef
  })

  return licenceDocumentHeader
}

async function _addLicenceHolderAndReturnToSameRef() {
  const name = 'Licence holder and returns to'
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    metadata: {
      ..._metadata(name),
      contacts: [_contact(name, 'Licence holder'), _contact(name, 'Returns to')]
    }
  })

  await ReturnLogHelper.add({
    licenceRef: licenceDocumentHeader.licenceRef
  })

  return licenceDocumentHeader
}

function _contact(name, role) {
  return {
    name,
    role,
    ..._address()
  }
}

function _metadata(name) {
  return {
    Name: name,
    isCurrent: true,
    isSummer: true
  }
}

/**
 * The address for a contact
 *
 * @returns {object} a common address
 */
function _address() {
  return {
    addressLine1: '4',
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
  seed,
  data: {
    address: _address
  }
}
