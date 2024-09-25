'use strict'

/**
 * Transforms NALD addresses data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformAddressesService
 */

const AddressPresenter = require('../../../presenters/import/legacy/address.presenter.js')
const FetchAddressesService = require('./fetch-address.service.js')
const ImportAddressValidator = require('../../../validators/import/address.validator.js')

/**
 * Transforms NALD addresses data into a validated object that matches the WRLS structure
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 * @param {object[]} transformedCompanies
 *
 */
async function go (regionCode, licenceId, transformedCompanies) {
  const naldAddresses = await FetchAddressesService.go(regionCode, licenceId)

  naldAddresses.forEach((naldAddress) => {
    const matchingCompany = _matchingCompany(transformedCompanies, naldAddress)

    const address = AddressPresenter.go(naldAddress)

    ImportAddressValidator.go(address)

    matchingCompany.addresses = [...(matchingCompany?.addresses || []), address]
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
