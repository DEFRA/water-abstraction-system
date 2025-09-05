'use strict'

/**
 * Formats data for the `address/{sessionId}/select` page
 * @module SelectPresenter
 */

/**
 * Formats data for the `address/{sessionId}/select` page
 *
 * @param {SessionModel} session - The session instance
 * @param {object[]} addresses - An array of address objects returned from the address lookup
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, addresses) {
  const { activeNavBar, address, pageTitleCaption } = session.addressJourney

  return {
    activeNavBar,
    addresses: _addresses(addresses),
    backLink: { href: `/system/address/${session.id}/postcode`, text: 'Back' },
    pageTitle: 'Select the address',
    pageTitleCaption: pageTitleCaption ?? null,
    postcode: address.postcode,
    sessionId: session.id
  }
}

function _addresses(addresses) {
  const displayAddresses = [
    {
      selected: true,
      text: addresses.length === 1 ? '1 address found' : `${addresses.length} addresses found`,
      value: 'select'
    }
  ]

  for (const address of addresses) {
    displayAddresses.push({ text: address.address, value: address.uprn })
  }

  return displayAddresses
}

module.exports = {
  go
}
