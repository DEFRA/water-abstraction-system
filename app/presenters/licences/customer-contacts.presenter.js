'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view customer contact details page
 * @module CustomerContactDetailsPresenter
 */

const ContactModel = require('../../models/contact.model.js')

/**
 * Formats data for the `/licences/{id}/contact-details` view customer contact details page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (customerContacts) {
  return {
    customerContacts: _customerContacts(customerContacts)
  }
}

function _buildCustomerName (customer) {
  const contact = ContactModel.fromJson(customer)

  return contact.$name()
}

function _customerContacts (customerContacts) {
  return customerContacts.map((customer) => {
    return {
      email: customer.email,
      name: _buildCustomerName(customer),
      communicationType: customer.communicationType
    }
  })
}

module.exports = {
  go
}
