'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view licence contact details page
 * @module ViewLicenceContactDetailsPresenter
 */

/**
 * Formats data for the `/licences/{id}/contact-details` view licence contact details page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (contactDetails) {
  return {
    activeTab: 'contact-details',
    customerId: _findCustomerId(contactDetails.licenceContacts),
    licenceContacts: _mapLicenceContacts(contactDetails.licenceContacts)
  }
}

function _findCustomerId (licenceContacts) {
  const customer = licenceContacts.find(con => con.licenceRole.name === 'licenceHolder')

  if (customer && customer.company) {
    return customer.company.id
  }

  return null
}

function _formatLicenceContactName (company, contact) {
  if (contact && contact.firstName && contact.lastName) {
    return `${contact.firstName} ${contact.lastName}`
  }

  if (company) {
    return company.name
  }

  return null
}

function _mapLicenceContacts (licenceContacts) {
  return licenceContacts.map(contact => {
    return {
      name: _formatLicenceContactName(contact.company, contact.contact),
      communicationType: contact.licenceRole.label,
      address: contact.address
    }
  })
}

module.exports = {
  go
}
