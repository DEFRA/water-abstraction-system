'use strict'

/**
 * Formats data for the `address/{sessionId}/manual` page
 * @module ManualAddressPresenter
 */

/**
 * Formats data for the `address/{sessionId}/manual` page
 *
 * @param {object} address - An object containing the saved address
 *
 * @returns {object} - The data formatted for the view template
 */
function go(address = {}) {
  return {
    pageTitle: 'Enter the address',
    ...(address?.addressLine1 && { addressLine1: address.addressLine1 }),
    ...(address?.addressLine2 && { addressLine2: address.addressLine2 }),
    ...(address?.town && { town: address.town }),
    ...(address?.county && { county: address.county }),
    ...(address?.postcode && { postcode: address.postcode })
  }
}

module.exports = {
  go
}
