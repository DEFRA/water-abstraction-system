'use strict'

const crypto = require('node:crypto')

const { futureDueDate } = require('../../../app/presenters/notices/base.presenter.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../helpers/licence.helper.js')
const { generateReference } = require('../helpers/return-requirement.helper.js')

/**
 * Creates a fixture for an ad-hoc additional email recipient
 *
 * This fixture generates a recipient object representing an additional email contact for an ad-hoc returns notice as
 * would be added to the `additionalRecipients` property in the session.
 *
 * @param {string} [licenceRef=null] - The licence reference for the recipient. If null one will be generated
 * @param {string} [email=null] - The email address for the recipient. If null a default will be used
 *
 * @returns {object} The ad-hoc returns notice additional email recipient fixture
 */
function additionalEmailRecipient(licenceRef = null, email = null) {
  const recipientLicenceRef = licenceRef ?? generateLicenceRef()
  const recipientEmail = email ?? 'additional@returns-notice.com'

  const recipient = {
    contact: null,
    contact_hash_id: _emailContactHashId(recipientEmail),
    contact_type: 'single use',
    due_date_status: 'all nulls',
    email: recipientEmail,
    latest_due_date: null,
    licence_ref: recipientLicenceRef,
    licence_refs: [recipientLicenceRef],
    message_type: 'Email',
    notificationDueDate: futureDueDate('email'),
    return_log_ids: [generateUUID()]
  }

  return recipient
}

/**
 * Creates a fixture for an ad-hoc additional postal recipient
 *
 * This fixture generates a recipient object representing an additional postal contact for an ad-hoc returns notice as
 * would be added to the `additionalRecipients` property in the session.
 *
 * @param {string} [licenceRef=null] - The licence reference for the recipient. If null one will be generated
 * @param {object} [contact=null] - The contact address for the recipient. If null a default will be used
 *
 * @returns {object} The ad-hoc returns notice additional postal recipient fixture
 */
function additionalPostalRecipient(licenceRef = null, contact = null) {
  const recipientLicenceRef = licenceRef ?? generateLicenceRef()

  // NOTE: We take what our helper function would generate for a contact and modify it to match would be set after
  // completing the address lookup journey, when the additional recipient is added to the session
  if (!contact) {
    contact = _contact('4', 'Additional')

    contact.country = 'United Kingdom'
  }

  const recipient = {
    contact,
    contact_hash_id: _contactHashId(contact),
    contact_type: 'single use',
    due_date_status: 'all nulls',
    email: null,
    latest_due_date: null,
    licence_ref: recipientLicenceRef,
    licence_refs: [recipientLicenceRef],
    message_type: 'Letter',
    notificationDueDate: futureDueDate('letter'),
    return_log_ids: [generateUUID()]
  }

  return recipient
}

/**
 * Creates a fixture for an abstraction alert notice additional contact recipient
 *
 * This fixture generates a recipient object representing an additional contact for abstraction alerts with a predefined
 * email and associated licence references.
 *
 * @returns {object} The abstraction alert additional contact recipient fixture
 */
function alertNoticeAdditionalContact() {
  const email = 'additional.contact@abs-alerts.com'

  return {
    contact: null,
    contact_hash_id: _emailContactHashId(email),
    contact_type: 'Additional contact',
    email,
    licence_refs: [generateLicenceRef()],
    message_type: 'Email'
  }
}

/**
 * Creates a fixture for an abstraction alert notice licence holder recipient
 *
 * This fixture generates a recipient object representing a licence holder contact for abstraction alerts with
 * predefined address and associated licence references.
 *
 * @returns {object} The abstraction alert licence holder recipient fixture
 */
function alertNoticeLicenceHolder() {
  const contact = _contact('Alertholder', 'Licence holder')

  return {
    contact,
    contact_hash_id: _contactHashId(contact),
    contact_type: 'licence holder',
    email: null,
    licence_refs: [generateLicenceRef()],
    message_type: 'Letter'
  }
}

/**
 * Creates a fixture for an abstraction alert notice primary user recipient
 *
 * This fixture generates a recipient object representing a primary user for abstraction alerts with a predefined
 * email and associated licence references.
 *
 * @returns {object} The abstraction alert primary user recipient fixture
 */
function alertNoticePrimaryUser() {
  const email = 'primary.user@abs-alerts.com'

  return {
    contact: null,
    contact_hash_id: _emailContactHashId(email),
    contact_type: 'primary user',
    email,
    licence_refs: [generateLicenceRef()],
    message_type: 'Email'
  }
}

/**
 * Creates a fixture for a renewal invitation licence holder recipient
 *
 * This fixture generates a recipient object representing a licence holder contact for a renewal invitation with
 * predefined address and associated licence references.
 *
 * @returns {object} The renewal invitation licence holder recipient fixture
 */
function renewalInvitationLicenceHolder() {
  const contact = _contact('4', 'Renewal licence holder')

  const recipient = {
    contact,
    contact_hash_id: _contactHashId(contact),
    contact_type: 'licence holder',
    email: null,
    licence_ref: generateLicenceRef(),
    message_type: 'Letter'
  }

  return _nonDownloadRecipient(recipient)
}

/**
 * Creates a fixture for a renewal invitation primary user recipient
 *
 * This fixture generates a recipient object representing a primary user for a renewal invitation with predefined
 * email and associated licence references.
 *
 * @returns {object} The renewal invitation primary user recipient fixture
 */
function renewalInvitationPrimaryUser() {
  const email = 'primary.user@renewal-invitation.com'

  const recipient = {
    contact: null,
    contact_hash_id: _emailContactHashId(email),
    contact_type: 'primary user',
    email,
    licence_ref: generateLicenceRef(),
    message_type: 'Email'
  }

  return _nonDownloadRecipient(recipient)
}

/**
 * Creates a fixture for a returns notice licence holder recipient
 *
 * This fixture generates a recipient object representing a licence holder contact for a returns notice with
 * predefined address and associated licence references.
 *
 * @param {boolean} [download=false] - Flag indicating if the fixture should represent the download format
 *
 * @returns {object} The returns notice licence holder recipient fixture
 */
function returnsNoticeLicenceHolder(download = false) {
  const contact = _contact('4', 'Returnsholder')

  const recipient = {
    contact,
    contact_hash_id: _contactHashId(contact),
    contact_type: 'licence holder',
    due_date: new Date('2025-04-28'),
    due_date_status: 'all nulls',
    end_date: new Date('2025-03-31'),
    email: null,
    latest_due_date: null,
    licence_ref: generateLicenceRef(),
    message_type: 'Letter',
    notificationDueDate: futureDueDate('letter'),
    return_reference: generateReference(),
    start_date: new Date('2024-04-01')
  }

  if (download) {
    return recipient
  }

  return _nonDownloadRecipient(recipient)
}

/**
 * Creates a fixture for a returns notice primary user recipient
 *
 * This fixture generates a recipient object representing a primary user for a returns notice with predefined
 * email and associated licence references.
 *
 * @param {boolean} [download=false] - Flag indicating if the fixture should represent the download format
 *
 * @returns {object} The returns notice primary user recipient fixture
 */
function returnsNoticePrimaryUser(download = false) {
  const email = 'primary.user@returns-notice.com'

  const recipient = {
    contact: null,
    contact_hash_id: _emailContactHashId(email),
    contact_type: 'primary user',
    due_date: new Date('2025-04-28'),
    due_date_status: 'all nulls',
    end_date: new Date('2025-03-31'),
    email,
    latest_due_date: null,
    licence_ref: generateLicenceRef(),
    message_type: 'Email',
    notificationDueDate: futureDueDate('email'),
    return_reference: generateReference(),
    start_date: new Date('2024-04-01')
  }

  if (download) {
    return recipient
  }

  return _nonDownloadRecipient(recipient)
}

/**
 * Creates a fixture for a returns notice returns user recipient
 *
 * This fixture generates a recipient object representing a returns user for a returns notice with predefined
 * email and associated licence references.
 *
 * @param {boolean} [download=false] - Flag indicating if the fixture should represent the download format
 *
 * @returns {object} The returns notice returns user recipient fixture
 */
function returnsNoticeReturnsAgent(download = false) {
  const email = 'returns.agent@returns-notice.com'

  const recipient = {
    contact: null,
    contact_hash_id: _emailContactHashId(email),
    contact_type: 'returns user',
    due_date: new Date('2025-04-28'),
    due_date_status: 'all nulls',
    end_date: new Date('2025-03-31'),
    email,
    latest_due_date: null,
    licence_ref: generateLicenceRef(),
    message_type: 'Email',
    notificationDueDate: futureDueDate('email'),
    return_reference: generateReference(),
    start_date: new Date('2024-04-01')
  }

  if (download) {
    return recipient
  }

  return _nonDownloadRecipient(recipient)
}

/**
 * Creates a fixture for a returns notice returns to recipient
 *
 * This fixture generates a recipient object representing a returns to contact for a returns notice with predefined
 * address and associated licence references.
 *
 * @param {boolean} [download=false] - Flag indicating if the fixture should represent the download format
 *
 * @returns {object} The returns notice returns to recipient fixture
 */
function returnsNoticeReturnsTo(download = false) {
  const contact = _contact('4', 'Returnsto')

  const recipient = {
    contact,
    contact_hash_id: _contactHashId(contact),
    contact_type: 'returns to',
    due_date: new Date('2025-04-28'),
    due_date_status: 'all nulls',
    end_date: new Date('2025-03-31'),
    email: null,
    latest_due_date: null,
    licence_ref: generateLicenceRef(),
    message_type: 'Letter',
    notificationDueDate: futureDueDate('letter'),
    return_log_id: generateUUID(),
    return_reference: generateReference(),
    start_date: new Date('2024-04-01')
  }

  if (download) {
    return recipient
  }

  return _nonDownloadRecipient(recipient)
}

/**
 * Create abstraction alerts recipients test data
 *
 * @returns {object} - Returns recipients for primaryUser, licenceHolder and additional contact
 */
function alertsRecipients() {
  return {
    additionalContact: _addAdditionalContact(),
    licenceHolder: _addLicenceHolder(),
    primaryUser: _addPrimaryUser()
  }
}

/**
 * Create recipients test data
 *
 * @returns {object} - Returns recipients for primaryUser, returnsUser, licenceHolder, returnsTo and
 * licenceHolderWithMultipleLicences
 */
function recipients() {
  return {
    primaryUser: _addPrimaryUser(),
    returnsUser: _addReturnsAgent(),
    licenceHolder: _addLicenceHolder(),
    returnsTo: _addReturnTo(),
    licenceHolderWithMultipleLicences: _addLicenceHolderWithMultipleLicences()
  }
}

// an additional contact will always be associated with a primary user or licence holder by the licence ref
function _addAdditionalContact() {
  return {
    licence_refs: [generateLicenceRef()],
    contact: null,
    contact_hash_id: '90129f6aa5b98734aa3fefd3f8cf86a',
    contact_type: 'additional contact',
    email: 'additional.contact@important.com',
    message_type: 'Email'
  }
}

function _addLicenceHolder() {
  return {
    contact: _contact('1', 'Harry Potter'),
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
    contact_type: 'licence holder',
    email: null,
    licence_refs: [generateLicenceRef()],
    message_type: 'Letter',
    return_log_ids: [generateUUID()]
  }
}

function _addPrimaryUser() {
  return {
    licence_refs: [generateLicenceRef()],
    contact: null,
    contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
    contact_type: 'primary user',
    email: 'primary.user@important.com',
    return_log_ids: [generateUUID()],
    message_type: 'Email'
  }
}

function _addReturnsAgent() {
  return {
    licence_refs: [generateLicenceRef()],
    contact: null,
    contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
    contact_type: 'returns user',
    email: 'returns.agent@important.com',
    return_log_ids: [generateUUID()],
    message_type: 'Email'
  }
}

function _addReturnTo() {
  // NOTE: By removing the postcode from this one contact, we know we'll get a recipient that when passed to the
  // presenters will result in the address being flagged as INVALID. This allows us to write tests for this scenario.
  const contact = _contact('2', 'Ronald Weasley')

  contact.postcode = null

  return {
    contact,
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed679893',
    contact_type: 'returns to',
    email: null,
    licence_refs: [generateLicenceRef()],
    message_type: 'Letter',
    return_log_ids: [generateUUID()]
  }
}

function _addLicenceHolderWithMultipleLicences() {
  return {
    contact: _contact('3', 'James Potter'),
    contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed09878075',
    contact_type: 'licence holder',
    email: null,
    licence_refs: [generateLicenceRef(), generateLicenceRef()],
    message_type: 'Letter',
    return_log_ids: [generateUUID()]
  }
}

/**
 * The fetch query handles duplicates by grouping them by a contact hash.
 *
 * This hash is unique to the contact address. For ease of testing, we are only incrementing the street number
 * and not using various addresses as we are only concerned with the contact hash ID to dedupe.
 *
 * @param line1 - the unique contract address
 * @returns {string} - a unique address
 * @private
 */
function _contact(line1, name) {
  return {
    address1: `${line1}`,
    address2: 'Privet Drive',
    address3: null,
    address4: null,
    address5: 'Little Whinging',
    address6: 'Surrey',
    name,
    postcode: 'WD25 7LR'
  }
}

function _emailContactHashId(email) {
  return crypto.createHash('md5').update(email).digest('hex')
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

function _nonDownloadRecipient(recipient) {
  return {
    contact: recipient.contact,
    contact_hash_id: recipient.contact_hash_id,
    contact_type: recipient.contact_type,
    due_date_status: recipient.due_date_status,
    email: recipient.email,
    latest_due_date: recipient.latest_due_date,
    licence_refs: [recipient.licence_ref],
    message_type: recipient.message_type,
    notificationDueDate: recipient.notificationDueDate,
    return_log_ids: [generateUUID()]
  }
}

module.exports = {
  additionalEmailRecipient,
  additionalPostalRecipient,
  alertNoticeAdditionalContact,
  alertNoticeLicenceHolder,
  alertNoticePrimaryUser,
  alertsRecipients,
  recipients,
  renewalInvitationLicenceHolder,
  renewalInvitationPrimaryUser,
  returnsNoticeLicenceHolder,
  returnsNoticePrimaryUser,
  returnsNoticeReturnsAgent,
  returnsNoticeReturnsTo
}
