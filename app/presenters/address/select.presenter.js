'use strict'

/**
 * Formats data for the `address/{sessionId}/select` page
 * @module SelectPresenter
 */

/**
 * Formats data for the `address/{sessionId}/select` page
 *
 * @param {Array} addresses - An array of address objects
 *
 * @returns {object} - The data formatted for the view template
 */
function go(addresses) {
  return {
    addresses: _selectAddressesArray(addresses),
    pageTitle: 'Select the address',
    postcode: addresses[0].postcode
  }
}

function _selectAddressesArray(addresses) {
  const displayAddresses = addresses.map((address) => {
    return {
      value: address.uprn,
      text: address.address
    }
  })

  displayAddresses.push({
    value: 'select',
    selected: true,
    text: addresses.length === 1 ? '1 address found' : `${addresses.length} addresses found`
  })

  return displayAddresses
}

module.exports = {
  go
}
