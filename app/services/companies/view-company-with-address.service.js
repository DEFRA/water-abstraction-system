'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/address/{addressId}/{role}' page
 *
 * @module ViewCompanyWithAddressService
 */

const CompanyWithAddressPresenter = require('../../presenters/companies/company-with-address.presenter.js')
const FetchAddressService = require('./fetch-address.service.js')
const FetchCompanyService = require('./fetch-company.service.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/address/{addressId}/{role}' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {string} addressId - the UUID of the address
 * @param {string} role - the licence role in kebab case e.g 'licence-holder'
 * @param {string} [licenceId=null] - the UUID of the licence the user was viewing
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, addressId, role, licenceId = null) {
  const company = await FetchCompanyService.go(companyId)
  const address = await FetchAddressService.go(addressId)

  const pageData = CompanyWithAddressPresenter.go(company, address, role, licenceId)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
