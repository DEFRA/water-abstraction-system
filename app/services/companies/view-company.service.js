'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/{role}' page
 *
 * @module ViewCompanyService
 */

const CompanyPresenter = require('../../presenters/companies/company.presenter.js')
const FetchCompanyDetailsService = require('./fetch-company-details.service.js')
const { roles } = require('../../lib/static-lookups.lib.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/{role}' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {string} role - the licence role in kebab case e.g 'licence-holder'
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, role) {
  const companyDetails = await FetchCompanyDetailsService.go(companyId, roles[role].name)

  const pageData = CompanyPresenter.go(companyDetails, role)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
