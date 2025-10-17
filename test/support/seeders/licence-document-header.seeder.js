'use strict'

/**
 * @module LicenceDocumentHeaderSeeder
 */

const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const ReturnLogHelper = require('../helpers/return-log.helper.js')

const primaryUser = {
  name: 'Primary User test',
  email: 'primary.user@important.com',
  role: 'primary_user'
}

/**
 * Adds licence document header and return log records to the database which are linked by licence ref
 *
 * @returns {Promise<object>} an object containing different licence document header instances for the licence holder
 */
async function seed() {
  return {
    licenceHolderAndReturnToWithReturnLog: await _licenceHolderAndReturnToWithReturnLog(),
    licenceHolderAndReturnToWithTheSameAddressWithReturnLog:
      await _licenceHolderAndReturnToWithTheSameAddressWithReturnLog(),
    licenceHolderWithReturnLog: await _licenceHolderWithReturnLog(),
    primaryUserAndReturnsAgentWithReturnLog: await _primaryUserAndReturnsAgentWithReturnLog(),
    primaryUserAndReturnsAgentWithTheSameEmailWithReturnLog:
      await _primaryUserAndReturnsAgentWithTheSameEmailWithReturnLog(),
    primaryUserWithReturnLog: await _primaryUserWithReturnLog()
  }
}

async function _primaryUserWithReturnLog() {
  const dueDate = '2025-04-28'

  const entityRole = await _addPrimaryUser()

  const returnLog = await _seedReturnLog(dueDate, entityRole.licenceRef)

  return {
    ...entityRole,
    returnLog
  }
}

async function _primaryUserAndReturnsAgentWithReturnLog() {
  const dueDate = '2025-05-26'

  const entityRole = await _addPrimaryUser()

  await _seedReturnsAgent(entityRole.licenceRef)

  const returnLog = await _seedReturnLog(dueDate, entityRole.licenceRef)

  return {
    ...entityRole,
    returnLog
  }
}

async function _primaryUserAndReturnsAgentWithTheSameEmailWithReturnLog() {
  const dueDate = '2025-05-27'

  const entityRole = await _addPrimaryUser()

  // Add a duplicate email - the email is the same, but the role is different
  await _addLicenceEntityRole({ ...primaryUser, role: 'user_returns' }, entityRole.licenceRef)

  const returnLog = await _seedReturnLog(dueDate, entityRole.licenceRef)

  return {
    ...entityRole,
    returnLog
  }
}

async function _licenceHolderWithReturnLog() {
  const dueDate = '2025-06-01'

  const licenceHolder = await _addLicenceHolder()

  const returnLog = await _seedReturnLog(dueDate, licenceHolder.licenceRef)

  return {
    ...licenceHolder,
    returnLog
  }
}

async function _licenceHolderAndReturnToWithReturnLog() {
  const dueDate = '2025-06-02'

  const licenceHolder = await _addLicenceHolderAndReturnTo()

  const returnLog = await _seedReturnLog(dueDate, licenceHolder.licenceRef)

  return {
    ...licenceHolder,
    returnLog
  }
}

async function _licenceHolderAndReturnToWithTheSameAddressWithReturnLog() {
  const dueDate = '2025-06-03'

  const licenceHolder = await _addLicenceHolderAndReturnToSameAddress()

  const returnLog = await _seedReturnLog(dueDate, licenceHolder.licenceRef)

  return {
    ...licenceHolder,
    returnLog
  }
}

/**
 * We always add a licence holder and a primary user to prove the primary user has precedence over the licence holder
 */
async function _addPrimaryUser() {
  const entityRole = await _addLicenceEntityRole(primaryUser)

  await _addLicenceHolder(entityRole.licenceRef)

  return entityRole
}

async function _seedReturnsAgent(licenceRef = null) {
  const returnsAgent = {
    name: 'User Returns test',
    email: 'returns.agent@important.com',
    role: 'user_returns'
  }

  return await _addLicenceEntityRole(returnsAgent, licenceRef)
}

async function _seedReturnLog(returnLogDueDate, licenceRef) {
  return await ReturnLogHelper.add({
    dueDate: returnLogDueDate,
    licenceRef
  })
}

async function _addLicenceEntityRole(entityRole, licenceRef = null) {
  const companyEntity = await LicenceEntityHelper.add({ type: 'company' })

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    ...(licenceRef && { licenceRef }),
    companyEntityId: companyEntity.id
  })

  const licenceEntity = await LicenceEntityHelper.add({
    name: entityRole.email
  })

  await LicenceEntityRoleHelper.add({
    companyEntityId: companyEntity.id,
    licenceEntityId: licenceEntity.id,
    role: entityRole.role
  })

  return licenceDocumentHeader
}

async function _addLicenceHolder(licenceRef = null) {
  return await LicenceDocumentHeaderHelper.add({
    ...(licenceRef && { licenceRef }),
    metadata: {
      contacts: [_contact('Licence holder', 'Licence holder')]
    }
  })
}

async function _addLicenceHolderAndReturnTo() {
  return await LicenceDocumentHeaderHelper.add({
    metadata: {
      contacts: [
        _contact('Licence holder', 'Licence holder'),
        _contact('Returns to', 'Returns to'),
        // This should not be returned in the query response
        _contact('Not a role', 'Not a role')
      ]
    }
  })
}

async function _addLicenceHolderAndReturnToSameAddress() {
  return await LicenceDocumentHeaderHelper.add({
    metadata: {
      // The role is used in the query should be correct, but the name is used in the contact hash, so the second contact
      // should not be returned in the query response (As both have the same address and name)
      contacts: [_contact('Potter', 'Licence holder'), _contact('Potter', 'Returns to')]
    }
  })
}

function _contact(name, role) {
  return {
    name,
    role,
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
