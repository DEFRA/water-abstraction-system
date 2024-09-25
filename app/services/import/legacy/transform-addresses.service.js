'use strict'

/**
 * Transforms NALD addresses data into a valid object that matches the WRLS structure
 * @module ImportLegacyTransformAddressesService
 */

const FetchAddressesService = require('./fetch-address.service.js')
const AddressPresenter = require('../../../presenters/import/legacy/address.presenter.js')

/**
 * Transforms NALD addresses data into a validated object that matches the WRLS structure
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 * @param {object[]} transformedCompanies
 *
 */
async function go (regionCode, licenceId, transformedCompanies) {
  const naldAddressess = await FetchAddressesService.go(regionCode, licenceId)

  naldAddressess.forEach((naldAddress) => {
    const address = AddressPresenter.go(naldAddress)

    console.log(address)
  })
}

module.exports = {
  go
}
