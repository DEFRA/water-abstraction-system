'use strict'

/**
 * @module RecipientsSeeder
 */

const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const ReturnLogHelper = require('../helpers/return-log.helper.js')

/**
 * Adds licence document header and return log records to the database which are linked by licence ref
 *
 * @returns {object[]} - an array of the added licenceDocumentHeaders
 */
async function seed() {
  return {
    licenceHolder: await _addLicenceHolder(),
    licenceHolderAndReturnTo: await _addLicenceHolderAndReturnToSameRef(),
    primaryUser: await _addPrimaryUser(),
    userReturns: await _addUserReturns()
  }
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

async function _addPrimaryUser() {
  return _addEntity('Primary User test', 'primary.user@important.com', 'primary_user')
}

async function _addUserReturns() {
  return _addEntity('User Returns test', 'returns.agent@important.com', 'user_returns')
}

async function _addEntity(name, email, role) {
  const companyEntity = await LicenceEntityHelper.add({ type: 'company' })

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId: companyEntity.id,
    metadata: {
      ..._metadata(name),
      contacts: [_contact(name, 'Licence holder'), _contact(name, 'Returns to')]
    }
  })

  const licenceEntity = await LicenceEntityHelper.add({
    name: email
  })

  await LicenceEntityRoleHelper.add({
    companyEntityId: companyEntity.id,
    licenceEntityId: licenceEntity.id,
    role
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
  seed
}
