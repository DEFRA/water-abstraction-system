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
    licenceContacts: _mapLicenceContacts(contactDetails.licenceContacts),
    customerContacts: _mapCustomerContacs(contactDetails.customerContacts)
  }
}

function _mapLicenceContacts (licenceContacts) {
  return licenceContacts.map(contact => {
    return {
      name: contact.company.name,
      communicationType: contact.licenceRole.label,
      address: contact.address
    }
  })
}
function _mapCustomerContacs (customerContacts) {
  return customerContacts.map(customer => customer)
}

module.exports = {
  go
}
