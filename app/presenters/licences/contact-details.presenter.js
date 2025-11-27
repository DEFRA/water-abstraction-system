'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 * @module ContactDetailsPresenter
 */

/**
 * Formats data for the `/licences/{id}/contact-details` view contact details page
 *
 * @param {object[]} contacts - The results from `FetchContactsService` to be formatted for the view
 * @param {object} licence - The id and licence ref of the licence
 *
 * @returns {object} The data formatted for the view template
 */
function go(contacts, licence) {
  const { licenceRef } = licence

  return {
    backLink: {
      text: 'Go back to search',
      href: '/licences'
    },
    customerId: _findCustomerId(contacts),
    licenceContacts: _licenceContacts(contacts),
    pageTitle: 'Contact details',
    pageTitleCaption: `Licence ${licenceRef}`
  }
}

function _findCustomerId(contacts) {
  const customerContact = contacts.find((contact) => {
    return contact.communicationType === 'Licence Holder'
  })

  if (customerContact) {
    return customerContact.companyId
  }

  return null
}

function _licenceContactName(contact) {
  if (contact.contactId) {
    return `${contact.firstName || ''} ${contact.lastName}`.trim()
  }

  return contact.companyName
}

function _licenceContacts(contacts) {
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
