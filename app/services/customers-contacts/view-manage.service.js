'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/customers-contacts/{id}/manage' page
 *
 * @module ViewManageService
 */

const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const FetchCustomerService = require('../customers/fetch-customer.service.js')
const ViewManagePresenter = require('../../presenters/customers-contacts/view-manage.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/customers-contacts/{id}/manage' page
 *
 * @param {string} id - the UUID of the customer contact
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id) {
  const companyContact = await FetchCompanyContactService.go(id)

  const company = await FetchCustomerService.go(companyContact.companyId)

  const pageData = ViewManagePresenter.go(company, companyContact)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
