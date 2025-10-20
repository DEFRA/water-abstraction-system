'use strict'

/**
 * @module LicenceDocumentHeaderSeeder
 */

const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const ReturnLogHelper = require('../helpers/return-log.helper.js')

/**
 * Adds licence document header and return log records to the database which are linked by licence ref
 *
 * @param {boolean} enableReturnLog - defaulted to true, this needs to be false if you do not want the `licenceDocumentHeader`
 * to be included in the recipients list
 * @param {string} returnLogEndDate - defaulted to the same end date set by the returnsLogHelper
 * @param {string} returnLogStartDate - defaulted to the same start date set by the returnsLogHelper
 *
 * @returns {Promise<object>} an object containing different licence document header instances and related entities
 * representing different scenarios
 */
async function seed(enableReturnLog = true, returnLogEndDate = '2023-03-31', returnLogStartDate = '2022-04-01') {
  return {
    licenceHolder: await _addLicenceHolder(enableReturnLog, returnLogEndDate, returnLogStartDate),
    licenceHolderAndReturnTo: await _addLicenceHolderAndReturnToSameRef(
      enableReturnLog,
      returnLogEndDate,
      returnLogStartDate
    ),
    primaryUser: await _addLicenceEntityRoles(enableReturnLog, returnLogEndDate, returnLogStartDate)
  }
}

async function _addLicenceEntityRoles(enableReturnLog, returnLogEndDate, returnLogStartDate) {
  const primaryUser = {
    name: 'Primary User test',
    email: 'primary.user@important.com',
    role: 'primary_user'
  }

  const userReturns = {
    name: 'User Returns test',
    email: 'returns.agent@important.com',
    role: 'user_returns'
  }

  const companyEntity = await LicenceEntityHelper.add({ type: 'company' })

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId: companyEntity.id,
    metadata: {
      ..._metadata(primaryUser.name),
      contacts: [_contact(primaryUser.name, 'Licence holder'), _contact(primaryUser.name, 'Returns to')]
    }
  })

  const licenceEntity = await LicenceEntityHelper.add({
    name: primaryUser.email
  })

  const licenceEntityReturns = await LicenceEntityHelper.add({
    name: userReturns.email
  })

  await LicenceEntityRoleHelper.add({
    companyEntityId: companyEntity.id,
    licenceEntityId: licenceEntity.id,
    role: primaryUser.role
  })

  await LicenceEntityRoleHelper.add({
    companyEntityId: companyEntity.id,
    licenceEntityId: licenceEntityReturns.id,
    role: userReturns.role
  })

  let returnLog

  if (enableReturnLog) {
    returnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: returnLogEndDate,
      startDate: returnLogStartDate,
      licenceRef: licenceDocumentHeader.licenceRef
    })
  }

  return { ...licenceDocumentHeader, returnLog }
}

async function _addLicenceHolder(enableReturnLog, returnLogEndDate, returnLogStartDate) {
  const name = 'Licence holder only'
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    metadata: {
      ..._metadata(name),
      contacts: [_contact(name, 'Licence holder')]
    }
  })

  let returnLog

  if (enableReturnLog) {
    returnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: returnLogEndDate,
      startDate: returnLogStartDate,
      licenceRef: licenceDocumentHeader.licenceRef
    })
  }

  return { ...licenceDocumentHeader, returnLog }
}

async function _addLicenceHolderAndReturnToSameRef(enableReturnLog, returnLogEndDate, returnLogStartDate) {
  const name = 'Licence holder and returns to'
  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    metadata: {
      ..._metadata(name),
      contacts: [_contact(name, 'Licence holder'), _contact(name, 'Returns to')]
    }
  })

  let returnLog

  if (enableReturnLog) {
    returnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: returnLogEndDate,
      startDate: returnLogStartDate,
      licenceRef: licenceDocumentHeader.licenceRef
    })
  }

  return { ...licenceDocumentHeader, returnLog }
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
