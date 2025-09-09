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
  const { activeNavBar, address, pageTitleCaption } = session.addressJourney

  return {
    activeNavBar,
    addressLine1: address.addressLine1 ?? null,
    addressLine2: address.addressLine2 ?? null,
    addressLine3: address.addressLine3 ?? null,
    addressLine4: address.addressLine4 ?? null,
    backLink: _backLink(address, session.id),
    pageTitle: 'Enter the address',
    pageTitleCaption: pageTitleCaption ?? null,
    postcode: address.postcode ?? null
  }
}

function _backLink(address, sessionId) {
  if (address.uprn) {
    return { href: `/system/address/${sessionId}/select`, text: 'Back' }
  }

  return { href: `/system/address/${sessionId}/postcode`, text: 'Back' }
}

module.exports = {
  go
}
