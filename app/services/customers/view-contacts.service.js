'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @module ViewContactsService
 */

const ContactsPresenter = require('../../presenters/customers/contacts.presenter.js')
const FetchContactsService = require('./fetch-company-contacts.service.js')
const FetchCustomerService = require('./fetch-customer.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/contacts' page
 *
 * @param {string} customerId - the UUID of the customer
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId, auth, page) {
  const customer = await FetchCustomerService.go(customerId)

  const { companyContacts, pagination } = await FetchContactsService.go(customerId, page)

  const pageData = ContactsPresenter.go(customer, companyContacts)

  const paginationData = PaginatorPresenter.go(
    pagination.total,
    Number(page),
    `/system/customers/${customerId}/contacts`,
    companyContacts.length,
    'contacts'
  )

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'contacts',
    ...pageData,
    pagination: paginationData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
