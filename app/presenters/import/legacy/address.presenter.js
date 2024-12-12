'use strict'

/**
 * Maps the legacy NALD address data to the WRLS format
 * @module AddressPresenter
 */

/**
 * Maps the legacy NALD address data to the WRLS format
 *
 * @param {ImportLegacyAddressType} address - the legacy NALD address
 * @param {string} dataSource
 *
 * @returns {object} the NALD company data transformed into the WRLS format for an address
 * ready for validation and persisting
 */
function go(address, dataSource) {
  return {
    address1: address.address1,
    address2: address.address2,
    address3: address.address3,
    address4: address.address4,
    address5: address.address5,
    address6: address.address6,
    postcode: address.postcode,
    country: address.country,
    externalId: address.external_id,
    dataSource
  }
}

module.exports = {
  go
}
