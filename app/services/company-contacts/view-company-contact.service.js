'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}' page
 *
 * @module ViewCompanyContactService
 */

const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const FetchCompanyService = require('../companies/fetch-company.service.js')
const ViewCompanyContactPresenter = require('../../presenters/company-contacts/view-company-contact.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/{id}' page
 *
 * @param {string} id - the UUID of the company contact
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, auth) {
  const companyContact = await FetchCompanyContactService.go(id)

  const company = await FetchCompanyService.go(companyContact.companyId)

  const pageData = ViewCompanyContactPresenter.go(company, companyContact)

  return {
    ...pageData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
