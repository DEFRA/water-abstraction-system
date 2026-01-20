'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/customers/{customerId}/contact/{contactId}' page
 *
 * @module ViewManageService
 */

const FetchContactService = require('./fetch-contact.service.js')
const FetchCustomerService = require('../fetch-customer.service.js')
const ViewManagePresenter = require('../../../presenters/customers/contact/view-manage.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/customers/{customerId}/contact/{contactId}' page
 *
 * @param {string} customerId - the UUID of the customer
 * @param {string} contactId - the UUID of the contact
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId, contactId) {
  const customer = await FetchCustomerService.go(customerId)

  const contact = await FetchContactService.go(customerId, contactId)

  const pageData = ViewManagePresenter.go(customer, contact)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
