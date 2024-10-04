'use strict'

/**
 * Transforms NALD data into a valid object that matches the WRLS structure for a company address
 * @module ImportLegacyTransformCompanyAddressesService
 */

const CompanyAddressPresenter = require('../../../presenters/import/legacy/company-address.presenter.js')
const FetchCompanyAddressesService = require('./fetch-company-address.service.js')

/**
 * Transforms NALD data into a valid object that matches the WRLS structure for a company address
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 * @param {object[]} transformedCompanies
 *
 */
async function go (regionCode, licenceId, transformedCompanies) {
  const naldAddresses = await FetchCompanyAddressesService.go(regionCode, licenceId)

  naldAddresses.forEach((naldAddress) => {
    const matchingCompany = _matchingCompany(transformedCompanies, naldAddress)

    const address = CompanyAddressPresenter.go(naldAddress)

    matchingCompany.companyAddresses.push(address)
  })
}

function _matchingCompany (transformedCompanies, naldAddress) {
  return transformedCompanies.find((company) => {
    return company.externalId === naldAddress.company_external_id
  })
}

module.exports = {
  go
}
