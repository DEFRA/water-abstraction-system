'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}' page
 *
 * @module ViewCompanyService
 */

const ROLE_MAPPINGS = {
  'licence-holder': {
    name: 'licenceHolder',
    label: 'Licence holder'
  },
  'returns-to': {
    name: 'returnsTo',
    label: 'Returns to'
  }
}

const CompanyPresenter = require('../../presenters/companies/company.presenter.js')
const FetchCompanyDetailsService = require('./fetch-company-details.service.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {string} role - the licence role in kebab case e.g 'licence-holder'
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, role) {
  const companyDetails = await FetchCompanyDetailsService.go(companyId, ROLE_MAPPINGS[role].name)

  const pageData = CompanyPresenter.go(companyDetails, ROLE_MAPPINGS[role].label)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
