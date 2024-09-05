'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view licence contact details page
 * @module ViewLicenceContactDetailsPresenter
 */

/**
 * Formats data for the `/licences/{id}/contact-details` view licence contact details page
 *
 * @returns {object} The data formatted for the view template
 */
function go (contacts) {
  return {
    customerId: _findCustomerId(contacts),
    licenceContacts: _licenceContacts(contacts)
  }
}

function _findCustomerId (contacts) {
  const customerContact = contacts.find((contact) => {
    return contact.communicationType === 'Licence Holder'
  })

  if (customerContact) {
    return customerContact.companyId
  }

  return null
}

function _licenceContactName (contact) {
  if (contact.contactId) {
    return `${contact.firstName || ''} ${contact.lastName}`.trim()
  }

  return contact.companyName
}

function _licenceContacts (contacts) {
  return contacts.map((contact) => {
    return {
      address: {
        address1: contact.address1,
        address2: contact.address2,
        address3: contact.address3,
        address4: contact.address4,
        address5: contact.address5,
        address6: contact.address6,
        country: contact.country,
        postcode: contact.postcode
      },
      communicationType: contact.communicationType,
      name: _licenceContactName(contact)
    }
  })
}

module.exports = {
  go
}
