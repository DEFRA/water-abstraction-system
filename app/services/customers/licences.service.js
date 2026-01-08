'use strict'

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/licences' page
 *
 * @module LicencesService
 */

const LicencesPresenter = require('../../presenters/customers/licences.presenter.js')
const FetchCustomerService = require('./fetch-customer.service.js')
const FetchLicencesService = require('./fetch-licences.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the 'customers/{id}/licences' page
 *
 * @param {string} customerId - the UUID of the customer
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(customerId, auth, page) {
  const customer = await FetchCustomerService.go(customerId)

  const { licences, pagination } = await FetchLicencesService.go(customerId, page)

  const pageData = LicencesPresenter.go(customer, licences)

  const paginationData = PaginatorPresenter.go(
    pagination.total,
    Number(page),
    `/system/customers/${customerId}/licences`,
    licences.length,
    'licences'
  )

  return {
    activeNavBar: 'search',
    activeSecondaryNav: 'licences',
    ...pageData,
    pagination: paginationData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
