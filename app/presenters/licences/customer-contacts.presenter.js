'use strict'

/**
 * Formats data for the `/licences/{id}/contact-details` view customer contact details page
 * @module CustomerContactsPresenter
 */

const { companyContact } = require('../customer.presenter.js')

/**
 * Formats data for the `/licences/{id}/contact-details` view customer contact details page
 *
 * @param {object[]} customerContacts - The results from `FetchCustomerContactsService` to be formatted for the view
 * template
 *
 * @returns {object} The data formatted for the view template
 */
function go(customerContacts) {
  return {
    customerContacts: _customerContacts(customerContacts)
  }
}

function _customerContacts(customerContacts) {
  return customerContacts.map((customer) => {
    return companyContact(customer)
  })
}

module.exports = {
  go
}
