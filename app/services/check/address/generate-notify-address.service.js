'use strict'

const CrmContactList = require('./legacy/crm-contact-list.js')
const LicenceDocumentHeaderModel = require('../../../models/licence-document-header.model.js')
const NotifyAddressPresenter = require('../../../presenters/notices/setup/notify-address.presenter.js')
const NotifyHelpers = require('./legacy/notify-helpers.js')

/**
 * Checks the address generated for Notify by the legacy code and ours for comparison
 *
 * @param {string} licenceRef - The licence ref to check the generated Notify address for
 *
 * @returns {Promise<object[]>} for each contact in the licence document header, the original contact, the legacy Notify
 * address result, and ours
 */
async function go(licenceRef) {
  const contacts = await _fetch(licenceRef)

  return contacts.map((contact) => {
    const legacyResult = _legacyResult(contact)
    const systemResult = NotifyAddressPresenter.go(contact)

    return {
      contact,
      legacyResult,
      systemResult
    }
  })
}

function _legacyResult(contact) {
  const legacyContact = {
    ...contact,
    entity_id: null,
    source: 'nald',
    email: null,
    role: contact.role.toLowerCase().replace(/ /g, '_'),
    address_1: contact.addressLine1,
    address_2: contact.addressLine2,
    address_3: contact.addressLine3,
    address_4: contact.addressLine4
  }

  legacyContact.entity_id = null
  legacyContact.source = 'nald'

  const contactInstance = CrmContactList.createContact(legacyContact)
  const notifyAddress = NotifyHelpers.mapContactAddress(contactInstance)

  return {
    address_line_1: notifyAddress.address_line_1,
    address_line_2: notifyAddress.address_line_2,
    address_line_3: notifyAddress.address_line_3,
    address_line_4: notifyAddress.address_line_4,
    address_line_5: notifyAddress.address_line_5,
    address_line_6: notifyAddress.address_line_6,
    postcode: notifyAddress.postcode
  }
}

async function _fetch(licenceRef) {
  const licenceDocumentHeader = await LicenceDocumentHeaderModel.query()
    .select()
    .where('licenceRef', licenceRef)
    .limit(1)
    .first()

  return licenceDocumentHeader.metadata.contacts
}

module.exports = {
  go
}
