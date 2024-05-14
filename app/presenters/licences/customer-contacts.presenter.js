'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view licence contact details page
 * @module CustomerContactDetailsPresenter
 */

/**
 * Formats data for the `/licences/{id}/contact-details` view licence contact details page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (customerContacts) {
  return {
    customerContacts: _customerContacts(customerContacts)
  }
}

function _buildCustomerName (customer) {
  let name = ''

  name += ` ${customer.salutation ?? ''}`
  name += ` ${customer.firstName ?? ''}`
  name += ` ${customer.middleInitials ? customer.middleInitials ?? '' : customer.initials ?? ''}`
  name += ` ${customer.lastName ?? ''}`
  name += ` ${customer.suffix ?? ''}`

  return name.replace(/ +(?= )/g, '').trim()
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
