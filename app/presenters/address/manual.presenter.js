'use strict'

/**
 * Formats data for the `address/{sessionId}/manual` page
 * @module ManualAddressPresenter
 */

/**
 * Formats data for the `address/{sessionId}/manual` page
 *
 * @param {SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { address, id } = session

  return {
    addressLine1: address.addressLine1 ?? null,
    addressLine2: address.addressLine2 ?? null,
    addressLine3: address.addressLine3 ?? null,
    addressLine4: address.addressLine4 ?? null,
    backLink: _backLink(address, id),
    pageTitle: 'Enter the address',
    postcode: address.postcode ?? null
  }
}

function _backLink(address, sessionId) {
  if (address.uprn) {
    return `/system/address/${sessionId}/select`
  }

  return `/system/address/${sessionId}/postcode`
}

module.exports = {
  go
}
