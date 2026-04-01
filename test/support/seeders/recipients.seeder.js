'use strict'

/**
 * @module NoticeRecipientsSeeder
 */

const crypto = require('node:crypto')

const AddressHelper = require('../helpers/address.helper.js')
const CompanyHelper = require('../helpers/company.helper.js')
const LicenceDocumentRoleHelper = require('../helpers/licence-document-role.helper.js')
const LicenceEntityModel = require('../../../app/models/licence-entity.model.js')
const LicenceEntityRoleModel = require('../../../app/models/licence-entity-role.model.js')
const LicenceRoleHelper = require('../helpers/licence-role.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

/**
 * Cleans up records created by the seeder
 *
 * It checks each 'recipient' for known records, and using its knowledge of 'recipients' deletes the data created
 * during testing.
 *
 * @param {object} recipient - The recipient created by these seeders
 */
async function clean(recipient) {
  if (typeof recipient.clean === 'function') {
    await recipient.clean()
  }

  if (recipient.licenceEntityRole) {
    await LicenceEntityModel.query().deleteById(recipient.licenceEntityRole.licenceEntityId)
    await LicenceEntityRoleModel.query().deleteById(recipient.licenceEntityRole.id)
  }

  if (recipient.returnLogs) {
    for (const returnLog of recipient.returnLogs) {
      await ReturnLogModel.query().deleteById(returnLog.id)
    }
  }
}

/**
 * Creates a "Licence holder" recipient
 *
 * This function sets up a complete licence structure with a company entity and a single licence holder contact.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {object} [licenceHolderSeedData] - The licence holder
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function licenceHolder(licenceSeedData, licenceHolderSeedData) {
  const contact = {
    address1: licenceHolderSeedData.address.address1,
    address2: licenceHolderSeedData.address.address2,
    address3: licenceHolderSeedData.address.address3,
    address4: licenceHolderSeedData.address.address4,
    address5: licenceHolderSeedData.address.address5,
    address6: licenceHolderSeedData.address.address6,
    country: licenceHolderSeedData.address.country,
    postcode: licenceHolderSeedData.address.postcode,
    name: licenceHolderSeedData.company.name
  }

  return {
    contact,
    company: licenceHolder.company,
    contactHashId: _contactHashId(contact),
    contactType: 'licence holder',
    email: null,
    licenceRef: licenceSeedData.licence.licenceRef,
    messageType: 'Letter',
    clean: async () => {
      await licenceSeedData.clean()
      await licenceHolderSeedData.clean()
    }
  }
}

/**
 * Creates a "Primary user" recipient for an existing licence holder
 *
 * This function accepts a previously created licence record and links it to a new licence entity role record
 * flagged with the role `primary_user`. To this it links an licence entity record setup as an individual with the
 * the 'registered' user's email name.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {object} primaryUserSeedData - The primary user seed data
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function primaryUser(licenceSeedData, primaryUserSeedData) {
  const { name: email } = primaryUserSeedData.individualEntity

  return {
    contact: null,
    contactHashId: _emailHashId(email),
    contactType: 'primary user',
    email,
    licenceRef: licenceSeedData.licence.licenceRef,
    messageType: 'Email',
    clean: async () => {
      await primaryUserSeedData.clean()
    }
  }
}

/**
 * Creates a "Returns user" recipient for an existing licence holder
 *
 * This function accepts a previously created licence holder record and links it to a new licence entity role record
 * flagged with the role `primary_user`. To this it links an licence entity record setup as an individual with the the
 * 'registered' user's email name.
 *
 * This is because to have a "Returns user", the licence must first be 'registered', which means it has a "Primary
 * user".
 *
 * Then we create a second licence entity and licence entity role for the "returns user" and voila, we have a returns
 * agent recipient.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {object} returnsUserSeedData - The returns user seed data
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function returnsUser(licenceSeedData, returnsUserSeedData) {
  const { name: email } = returnsUserSeedData.individualEntity

  return {
    contact: null,
    contactHashId: _emailHashId(email),
    contactType: 'returns user',
    email,
    licenceRef: licenceSeedData.licence.licenceRef,
    messageType: 'Email',
    clean: async () => {
      await returnsUserSeedData.clean()
    }
  }
}

/**
 * Add a "Returns to" contact for an existing licence holder and updates the licence document header.
 *
 * This function accepts a previously created licence holder record and adds to it a "Returns to" contact. You will
 * never get a licence with _only_ a 'returns to' contact, so adding to an existing `LicenceDocumentHeader` makes sense
 * for "returns to" recipients.
 *
 * @param {object} licenceSeedData - The licence seed data
 * @param {object} [licenceHolderSeedData] - The licence holder
 * @param {string} [name] - The name for the "Returns to" contact
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function returnsTo(licenceSeedData, licenceHolderSeedData = null, name = 'Test Limited') {
  const address = _address()

  const addressData = await AddressHelper.add({
    ...address
  })

  let company

  if (licenceHolderSeedData?.company) {
    company = licenceHolderSeedData.company
  } else {
    company = await CompanyHelper.add({
      name
    })
  }

  const licenceRole = LicenceRoleHelper.select('returnsTo')

  await LicenceDocumentRoleHelper.add({
    licenceRoleId: licenceRole.id,
    licenceDocumentId: licenceSeedData.licenceDocument.id,
    companyId: company.id,
    addressId: addressData.id,
    endDate: null
  })

  const contact = {
    ...address,
    name
  }

  return {
    contact,
    contactHashId: _contactHashId(contact),
    contactType: 'returns to',
    email: null,
    licenceRef: licenceSeedData.licence.licenceRef,
    messageType: 'Letter'
  }
}

/**
 * Transforms a recipient and return log into a 'fetch recipient for download' result
 *
 * Use when you need to verify the result of, for example, FetchReturnsInvitationRecipientsService with the `download`
 * flag set to true.
 *
 * @param {object} recipient - The recipient object containing contact information
 * @param {object} returnLog - The return log object
 *
 * @returns {object} The transformed downloading result object
 */
function transformToDownloadingResult(recipient, returnLog) {
  return {
    contact: recipient.contact,
    contact_hash_id: recipient.contactHashId,
    contact_type: recipient.contactType,
    due_date: returnLog.dueDate,
    due_date_status: returnLog.dueDate ? 'all populated' : 'all nulls',
    end_date: returnLog.endDate,
    email: recipient.email,
    latest_due_date: returnLog.dueDate,
    licence_ref: returnLog.licenceRef,
    message_type: recipient.messageType,
    return_log_id: returnLog.id,
    return_reference: returnLog.returnReference,
    start_date: returnLog.startDate
  }
}

/**
 * Transforms a recipient and return log into a 'fetch recipient for sending' result
 *
 * Use when you need to verify the result of, for example, FetchReturnsInvitationRecipientsService with the `download`
 * flag set to false.
 *
 * > The `licence_refs` and `return_log_ids` properties are very much dependent on the `due_return_logs` query run as
 * > part of the fetch. This means it is not possible for this seeder to determine what these should be. Therefore,
 * > these need to have been calculated and applied to the `recipient` _before_ it is passed to this transformer.
 *
 * @param {object} recipient - The recipient object containing contact information
 *
 * @returns {object} The transformed sending result object
 */
function transformToSendingResult(recipient) {
  return {
    contact: recipient.contact,
    contact_hash_id: recipient.contactHashId,
    contact_type: recipient.contactType,
    due_date_status: 'all nulls',
    email: recipient.email,
    latest_due_date: null,
    licence_refs: recipient.licenceRefs,
    message_type: recipient.messageType,
    return_log_ids: recipient.returnLogIds
  }
}

function _address() {
  return {
    address1: '4',
    address2: 'Privet Drive',
    address3: 'Little Whinging',
    address4: 'Surrey',
    address5: null,
    address6: null,
    country: null,
    postcode: 'WD25 7LR'
  }
}

function _contactHashId(contact) {
  const name = contact.name
  const address1 = contact.address1
  const address2 = contact.address2 ?? ''
  const address3 = contact.address3 ?? ''
  const address4 = contact.address4 ?? ''
  const address5 = contact.address5 ?? ''
  const address6 = contact.address6 ?? ''
  const postcode = contact.postcode ?? ''
  const country = contact.country ?? ''

  const _combinedString = `${name}${address1}${address2}${address3}${address4}${address5}${address6}${postcode}${country}`

  return crypto.createHash('md5').update(_combinedString.toLowerCase()).digest('hex')
}

function _emailHashId(email) {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex')
}

module.exports = {
  clean,
  licenceHolder,
  primaryUser,
  returnsUser,
  returnsTo,
  transformToDownloadingResult,
  transformToSendingResult
}
