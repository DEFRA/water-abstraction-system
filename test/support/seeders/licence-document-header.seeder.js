'use strict'

/**
 * @module LicenceDocumentHeaderSeeder
 */

const CompanyContactHelper = require('../helpers/company-contact.helper.js')
const ContactHelper = require('../helpers/contact.helper.js')
const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceDocumentHelper = require('../helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../helpers/licence-document-role.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const LicenceRoleHelper = require('../helpers/licence-role.helper.js')
const ReturnLogHelper = require('../helpers/return-log.helper.js')

const additionalContactOne = {
  firstName: 'Ron',
  lastName: 'Burgundy',
  email: 'Ron.Burgundy@news.com'
}

const additionalContactTwo = {
  firstName: 'Brick',
  lastName: 'Tamland',
  email: 'Brick.Tamland@news.com'
}

const primaryUser = {
  name: 'Primary User test',
  email: `primary.user@important.com`,
  role: 'primary_user'
}

const returnsAgent = {
  name: 'User Returns test',
  email: 'returns.agent@important.com',
  role: 'user_returns'
}

/**
 * Adds licence document header and return log records to the database which are linked by licence ref
 *
 * If provided a return log due date the seed will add a return log record.
 *
 * @param {string} [date] - a string representing the year and month ('2020-01') the seed will add the date.
 *
 * @returns {Promise<object>} an object containing different licence document header instances for the licence holder
 */
async function seed(date) {
  let dates = {}

  if (date) {
    dates = {
      one: `${date}01`,
      two: `${date}02`,
      three: `${date}03`,
      four: `${date}04`,
      five: `${date}05`,
      seven: `${date}07`,
      eight: `${date}08`,
      nine: `${date}09`,
      ten: `${date}10`,
      eleven: `${date}11`,
      twelve: `${date}12`,
      thirteen: `${date}13`,
      fourteen: `${date}14`
    }
  }

  return {
    additionalContact: await _additionalContact(),
    licenceHolder: await _licenceHolder(dates.one),
    licenceHolderAndReturnTo: await _licenceHolderAndReturnTo(dates.two),
    licenceHolderAndReturnToLetter: await _licenceHolderAndReturnTo(dates.three),
    licenceHolderAndReturnToLetterWithTheSameAddress: await _licenceHolderAndReturnToWithTheSameAddress(dates.four),
    licenceHolderAndReturnToWithTheSameAddress: await _licenceHolderAndReturnToWithTheSameAddress(dates.five),
    licenceHolderReturnLogGreaterThanToday: await _licenceHolder(dates.ten, '4000-01-01'),
    licenceHolderWithAdditionalContact: await _licenceHolderWithAdditionalContact(),
    multipleAdditionalContact: await _multipleAdditionalContact(),
    multipleAdditionalContactDifferentLicenceRefs: await _multipleAdditionalContactDifferentLicenceRefs(),
    multipleAdditionalContactWithAndWithoutAlerts: await _multipleAdditionalContactWithAndWithoutAlerts(),
    multipleLicenceRefs: await _multipleLicenceRefs(dates.thirteen),
    primaryUser: await _primaryUser(dates.seven),
    primaryUserAndReturnsAgent: await _primaryUserAndReturnsAgent(dates.eight),
    primaryUserAndReturnsAgentWithTheSameEmail: await _primaryUserAndReturnsAgentWithTheSameEmail(dates.nine),
    primaryUserDueDate: await _primaryUserDueDate(dates.eleven),
    primaryUserMultipleReturnLogs: await _primaryUserMultipleReturnLogs(dates.twelve),
    primaryUserWithAdditionalContact: await _primaryUserWithAdditionalContact(),
    licenceHolderTransferredReturnLog: await _licenceHolderTransferredReturnLog(dates.fourteen)
  }
}

async function _addAdditionalContact(contact, licenceDocumentId, abstractionAlerts = true) {
  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    licenceDocumentId,
    endDate: null
  })

  const licenceRole = await LicenceRoleHelper.select('additionalContact')

  const companyContact = await CompanyContactHelper.add({
    companyId: licenceDocumentRole.companyId,
    licenceRoleId: licenceRole.id,
    abstractionAlerts
  })

  await ContactHelper.add({
    id: companyContact.contactId,
    ...contact
  })

  return licenceDocumentRole
}

/**
 * Alerts have the concept of a 'current' 'additional contact'.
 *
 * The current additional contact is the one where the "endDate" is null.
 *
 * This helper adds 'expired' additional contacts to the licence document.
 *
 * This should not be found in the response from the query.
 *
 * @private
 */
async function _addAdditionalContactEndDatePassed(contact, licenceDocumentId) {
  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    licenceDocumentId,
    endDate: new Date('2023-01-01')
  })

  const licenceRole = await LicenceRoleHelper.select('additionalContact')

  const companyContact = await CompanyContactHelper.add({
    companyId: licenceDocumentRole.companyId,
    licenceRoleId: licenceRole.id,
    abstractionAlerts: true
  })

  await ContactHelper.add({
    id: companyContact.contactId,
    ...contact
  })
}

async function _addLicenceEntity(licenceDocumentHeader, entityRole) {
  const licenceEntity = await LicenceEntityHelper.add({
    name: entityRole.email
  })

  await LicenceEntityRoleHelper.add({
    companyEntityId: licenceDocumentHeader.companyEntityId,
    licenceEntityId: licenceEntity.id,
    role: entityRole.role
  })
}

async function _addLicenceHolder() {
  const companyEntity = await LicenceEntityHelper.add({ type: 'company' })

  // Defaults the contact with a Licence holder
  return await LicenceDocumentHeaderHelper.add({
    companyEntityId: companyEntity.id,
    metadata: {
      contacts: [_contact('Potter', 'Licence holder')]
    }
  })
}

async function _addLicenceHolderAndReturnTo() {
  return await LicenceDocumentHeaderHelper.add({
    metadata: {
      contacts: [
        _contact('Potter', 'Licence holder'),
        _contact('Weasley', 'Returns to'),
        // Duplicate 'Returns to'
        _contact('Weasley', 'Returns to'),
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

async function _addPrimaryUser() {
  const licenceDocumentHeader = await _addLicenceHolder()

  await _addLicenceEntity(licenceDocumentHeader, primaryUser)

  // Add a duplicate primary user with the same email
  await _addLicenceEntity(licenceDocumentHeader, primaryUser)

  return licenceDocumentHeader
}

async function _addReturnLog(date, licenceRef, endDate = null, isCurrent = true) {
  if (date) {
    const defaults = ReturnLogHelper.defaults()

    defaults.startDate = date
    defaults.endDate = endDate || date
    defaults.dueDate = null
    defaults.licenceRef = licenceRef
    defaults.quarterly = false
    defaults.metadata.isCurrent = isCurrent

    return await ReturnLogHelper.add(defaults)
  }

  return null
}

async function _additionalContact(licenceRef = null) {
  const licenceDocument = await LicenceDocumentHelper.add({
    ...(licenceRef && { licenceRef })
  })

  await _addAdditionalContact(additionalContactOne, licenceDocument.id)

  await _addAdditionalContactEndDatePassed(additionalContactOne, licenceDocument.id)

  return licenceDocument
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

async function _licenceHolder(date, endDate = null) {
  const licenceDocumentHeader = await _addLicenceHolder()

  const returnLog = await _addReturnLog(date, licenceDocumentHeader.licenceRef, endDate)

  return {
    ...licenceDocumentHeader,
    returnLog
  }
}

async function _licenceHolderAndReturnTo(date) {
  const licenceHolder = await _addLicenceHolderAndReturnTo()

  const returnLog = await _addReturnLog(date, licenceHolder.licenceRef)

  return {
    ...licenceHolder,
    returnLog
  }
}

async function _licenceHolderAndReturnToWithTheSameAddress(date) {
  const licenceHolder = await _addLicenceHolderAndReturnToSameAddress()

  const returnLog = await _addReturnLog(date, licenceHolder.licenceRef)

  return {
    ...licenceHolder,
    returnLog
  }
}

async function _licenceHolderTransferredReturnLog(date, endDate = null) {
  const licenceDocumentHeader = await _addLicenceHolder()

  const returnLog = await _addReturnLog(date, licenceDocumentHeader.licenceRef, endDate, false)

  return {
    ...licenceDocumentHeader,
    returnLog
  }
}

async function _licenceHolderWithAdditionalContact() {
  const licenceHolder = await _addLicenceHolder()

  await _additionalContact(licenceHolder.licenceRef)

  return licenceHolder
}

async function _multipleAdditionalContact() {
  const licenceDocument = await LicenceDocumentHelper.add()

  await _addAdditionalContact(additionalContactOne, licenceDocument.id)

  await _addAdditionalContact(additionalContactTwo, licenceDocument.id)

  return licenceDocument
}

async function _multipleAdditionalContactDifferentLicenceRefs() {
  const licenceDocument = await LicenceDocumentHelper.add()
  const licenceDocumentTwo = await LicenceDocumentHelper.add()

  await _addAdditionalContact(additionalContactOne, licenceDocument.id)

  await _addAdditionalContact(additionalContactOne, licenceDocumentTwo.id)

  return {
    licenceDocument,
    licenceDocumentTwo
  }
}

async function _multipleAdditionalContactWithAndWithoutAlerts() {
  const licenceDocument = await LicenceDocumentHelper.add()

  await _addAdditionalContact(additionalContactOne, licenceDocument.id)

  await _addAdditionalContact(additionalContactTwo, licenceDocument.id, false)

  return licenceDocument
}

async function _primaryUser(date) {
  const licenceDocumentHeader = await _addPrimaryUser()

  await _addLicenceEntity(licenceDocumentHeader, primaryUser)

  const returnLog = await _addReturnLog(date, licenceDocumentHeader.licenceRef)

  return {
    ...licenceDocumentHeader,
    returnLog
  }
}

async function _primaryUserAndReturnsAgent(date) {
  const licenceDocumentHeader = await _addLicenceHolder()

  await _addLicenceEntity(licenceDocumentHeader, primaryUser)

  await _addLicenceEntity(licenceDocumentHeader, returnsAgent)

  const returnLog = await _addReturnLog(date, licenceDocumentHeader.licenceRef)

  return {
    ...licenceDocumentHeader,
    returnLog
  }
}

async function _primaryUserAndReturnsAgentWithTheSameEmail(date) {
  const licenceDocumentHeader = await _addPrimaryUser(primaryUser)

  const licenceEntity = await LicenceEntityHelper.add({
    name: primaryUser.email
  })

  await LicenceEntityRoleHelper.add({
    companyEntityId: licenceDocumentHeader.companyEntityId,
    licenceEntityId: licenceEntity.id,
    role: returnsAgent.role
  })

  const returnLog = await _addReturnLog(date, licenceDocumentHeader.licenceRef)

  return {
    ...licenceDocumentHeader,
    returnLog
  }
}

async function _primaryUserDueDate(date) {
  const licenceDocumentHeader = await _addPrimaryUser()

  let returnLog = {}

  if (date) {
    returnLog = await ReturnLogHelper.add({
      startDate: date,
      endDate: date,
      dueDate: date,
      licenceRef: licenceDocumentHeader.licenceRef,
      quarterly: false
    })
  }

  return {
    ...licenceDocumentHeader,
    returnLog
  }
}

async function _primaryUserMultipleReturnLogs(date) {
  const licenceDocumentHeader = await _addPrimaryUser()

  const returnLog = await _addReturnLog(date, licenceDocumentHeader.licenceRef)

  const returnLogTwo = await _addReturnLog(date, licenceDocumentHeader.licenceRef)

  return {
    ...licenceDocumentHeader,
    returnLog,
    returnLogTwo
  }
}

async function _primaryUserWithAdditionalContact() {
  const primaryUser = await _addPrimaryUser()

  await _additionalContact(primaryUser.licenceRef)

  return primaryUser
}

/**
 * A contact can have multiple licences / licence refs. We need to merge the licence refs into a single recipient.
 *
 * This seeder ensures we can check a recipient with the same contact hash contains both of the licence refs and return
 * logs in the response.
 *
 *@private
 */
async function _multipleLicenceRefs(date) {
  const licenceDocumentHeader = await _addLicenceHolder()
  const licenceDocumentHeaderTwo = await _addLicenceHolder()

  const returnLog = await _addReturnLog(date, licenceDocumentHeader.licenceRef)
  const returnLogTwo = await _addReturnLog(date, licenceDocumentHeaderTwo.licenceRef)

  return {
    ...licenceDocumentHeader,
    returnLog,
    returnLogTwo
  }
}

module.exports = {
  seed
}
