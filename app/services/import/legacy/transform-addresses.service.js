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

  const transformedAddresses = []

  naldAddresses.forEach((naldAddress) => {
    const address = AddressPresenter.go(naldAddress)

    ImportAddressValidator.go(address)

    transformedAddresses.push(address)
  })

  return {
    transformedAddresses
  }
}

module.exports = {
  go
}
