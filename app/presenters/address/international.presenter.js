'use strict'

/**
 * Formats data for the `address/{sessionId}/international` page
 * @module InternationalPresenter
 */

const { countryLookup } = require('./base-address.presenter.js')

/**
 * Formats data for the `address/{sessionId}/international` page
 *
 * @param {SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { activeNavBar, address } = session.addressJourney

  return {
    activeNavBar,
    addressLine1: address.addressLine1 ?? null,
    addressLine2: address.addressLine2 ?? null,
    addressLine3: address.addressLine3 ?? null,
    addressLine4: address.addressLine4 ?? null,
    backLink: { href: `/system/address/${session.id}/postcode`, text: 'Back' },
    country: countryLookup(address?.country),
    pageTitle: 'Enter the international address',
    postcode: address.postcode ?? null
  }
}

module.exports = {
  go
}
