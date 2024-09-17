'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view customer contact details page
 * @module CustomerContactsPresenter
 */

const ContactModel = require('../../models/contact.model.js')

/**
 * Formats data for the `/licences/{id}/contact-details` view customer contact details page
 *
 * @param {object[]} customerContacts - The results from `FetchCustomerContactsService` to be formatted for the view
 * template
 *
 * @returns {object} The data formatted for the view template
 * @returns {object} The data formatted for the view template
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
