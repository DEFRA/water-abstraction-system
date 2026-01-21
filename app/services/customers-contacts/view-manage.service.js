'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/customers-contacts/{id}/manage' page
 *
 * @module ViewManageService
 */

const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const FetchCustomerService = require('../customers/fetch-customer.service.js')
const ViewManagePresenter = require('../../presenters/customers-contacts/view-manage.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/customers-contacts/{id}/manage' page
 *
 * @param {string} id - the UUID of the customer contact
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, auth) {
  const companyContact = await FetchCompanyContactService.go(id)

  const company = await FetchCustomerService.go(companyContact.companyId)

  const pageData = ViewManagePresenter.go(company, companyContact)

  return {
    ...pageData,
    activeNavBar: 'search',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
