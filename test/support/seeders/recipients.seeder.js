'use strict'

/**
 * @module NoticeRecipientsSeeder
 */

const crypto = require('node:crypto')

const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceDocumentHeaderModel = require('../../../app/models/licence-document-header.model.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')
const LicenceEntityModel = require('../../../app/models/licence-entity.model.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const LicenceEntityRoleModel = require('../../../app/models/licence-entity-role.model.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const { generateLicenceRef } = require('../helpers/licence.helper.js')

/**
 * Cleans up records created by the seeder
 *
 * It checks each 'recipient' for known records, and using its knowledge of 'recipients' deletes the data created
 * during testing.
 *
 * @param {object} recipient - The recipient created by these seeders
 */
async function clean(recipient) {
  if (recipient.licenceDocumentHeader) {
    await LicenceDocumentHeaderModel.query().deleteById(recipient.licenceDocumentHeader.id)
    await LicenceEntityModel.query().deleteById(recipient.licenceDocumentHeader.companyEntityId)
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
 * @param {string} name - The name of the licence holder
 * @param {string} [licenceRef=null] - An optional licence reference to assign to the recipient
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function licenceHolder(name, licenceRef = null) {
  const companyEntity = await LicenceEntityHelper.add({ type: 'company' })
  const contact = _licenceDocumentHeaderContact(name, 'Licence holder')

  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    companyEntityId: companyEntity.id,
    licenceRef,
    metadata: {
      contacts: [contact]
    }
  })

  return {
    contact,
    contactHashId: _contactHashId(contact),
    contactType: 'licence holder',
    email: null,
    licenceDocumentHeader,
    licenceEntityRole: null,
    licenceRef: licenceDocumentHeader.licenceRef,
    messageType: 'Letter'
  }
}

/**
 * Creates a "Primary user" recipient for an existing licence holder
 *
 * This function accepts a previously created licence holder record and links it to a new licence entity role record
 * flagged with the role `primary_user`. To this it links an licence entity record setup as an individual with the
 * the 'registered' user's email name.
 *
 * @param {object} licenceDocumentHeader - The licence document header holding licence holder details
 * @param {string} email - The email address of the primary user
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function primaryUser(licenceDocumentHeader, email) {
  const individualEntity = await LicenceEntityHelper.add({ name: email, type: 'individual' })
  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    companyEntityId: licenceDocumentHeader.companyEntityId,
    licenceEntityId: individualEntity.id,
    role: 'primary_user'
  })

  return {
    contact: null,
    contactHashId: _emailHashId(email),
    contactType: 'primary user',
    email,
    licenceDocumentHeader,
    licenceEntityRole,
    licenceRef: licenceDocumentHeader.licenceRef,
    messageType: 'Email'
  }
}

/**
 * Creates a "Returns agent" recipient for an existing licence holder
 *
 * This function accepts a previously created licence holder record and links it to a new licence entity role record
 * flagged with the role `primary_user`. To this it links an licence entity record setup as an individual with the the
 * 'registered' user's email name.
 *
 * This is because to have a "Returns agent", the licence must first be 'registered', which means it has a "Primary
 * user".
 *
 * Then we create a second licence entity and licence entity role for the "returns agent" and voila, we have a returns
 * agent recipient.
 *
 * @param {object} licenceDocumentHeader - The licence document header holding licence holder details
 * @param {string} email - The email address of the returns agent
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function returnsAgent(licenceDocumentHeader, email) {
  const individualEntity = await LicenceEntityHelper.add({ name: email, type: 'individual' })
  const licenceEntityRole = await LicenceEntityRoleHelper.add({
    companyEntityId: licenceDocumentHeader.companyEntityId,
    licenceEntityId: individualEntity.id,
    role: 'user_returns'
  })

  return {
    contact: null,
    contactHashId: _emailHashId(email),
    contactType: 'returns agent',
    email,
    licenceDocumentHeader,
    licenceEntityRole,
    licenceRef: licenceDocumentHeader.licenceRef,
    messageType: 'Email'
  }
}

/**
 * Add a "Returns to" contact for an existing licence holder and updates the licence document header.
 *
 * This function accepts a previously created licence holder record and adds to it a "Returns to" contact. You will
 * never get a licence with _only_ a 'returns to' contact, so adding to an existing `LicenceDocumentHeader` makes sense
 * for "returns to" recipients.
 *
 * @param {object} licenceDocumentHeader - The licence document header holding licence holder details
 * @param {string} name - The name for the "Returns to" contact
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
async function returnsTo(licenceDocumentHeader, name) {
  const contact = _licenceDocumentHeaderContact(name, 'Returns to')
  const { metadata } = licenceDocumentHeader

  metadata.contacts.push(contact)

  await licenceDocumentHeader.$query().patch({ metadata })

  return {
    contact,
    contactHashId: _contactHashId(contact),
    contactType: 'returns to',
    email: null,
    licenceDocumentHeader,
    licenceEntityRole: null,
    licenceRef: licenceDocumentHeader.licenceRef,
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

function _contactHashId(contact) {
  const salutation = contact.salutation ?? ''
  const forename = contact.forename ?? ''
  const initials = contact.initials ?? ''
  const name = contact.name
  const addressLine1 = contact.addressLine1
  const addressLine2 = contact.addressLine2 ?? ''
  const addressLine3 = contact.addressLine3 ?? ''
  const addressLine4 = contact.addressLine4 ?? ''
  const town = contact.town ?? ''
  const county = contact.county ?? ''
  const postcode = contact.postcode ?? ''
  const country = contact.country ?? ''

  const _combinedString = `${salutation}${forename}${initials}${name}${addressLine1}${addressLine2}${addressLine3}${addressLine4}${town}${county}${postcode}${country}`

  return crypto.createHash('md5').update(_combinedString.toLowerCase()).digest('hex')
}

function _emailHashId(email) {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex')
}

function _licenceDocumentHeaderContact(name, role) {
  return {
    addressLine1: '4',
    addressLine2: 'Privet Drive',
    addressLine3: null,
    addressLine4: null,
    country: null,
    county: 'Surrey',
    forename: 'Harry',
    initials: 'J',
    name,
    postcode: 'WD25 7LR',
    role,
    salutation: null,
    town: 'Little Whinging',
    type: 'Person'
  }
}

module.exports = {
  clean,
  licenceHolder,
  primaryUser,
  returnsAgent,
  returnsTo,
  transformToDownloadingResult,
  transformToSendingResult
}
