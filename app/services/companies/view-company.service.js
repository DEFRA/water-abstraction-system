'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}' page
 *
 * @module ViewCompanyService
 */

const CompanyPresenter = require('../../presenters/companies/company.presenter.js')
const FetchCompanyService = require('./fetch-company.service.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}' page
 *
 * @param {string} companyId - the UUID of the company
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId) {
  const company = await FetchCompanyService.go(companyId)

  const pageData = CompanyPresenter.go(company)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
