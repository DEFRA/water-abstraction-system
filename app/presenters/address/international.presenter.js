'use strict'

/**
 * Formats data for the `address/{sessionId}/international` page
 * @module InternationalPresenter
 */

const { countries } = require('../../lib/static-lookups.lib.js')

/**
 * Formats data for the `address/{sessionId}/international` page
 *
 * @param {SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { address, id } = session

  return {
    addressLine1: address?.international?.addressLine1 ?? null,
    addressLine2: address?.international?.addressLine2 ?? null,
    addressLine3: address?.international?.addressLine3 ?? null,
    addressLine4: address?.international?.addressLine4 ?? null,
    backLink: `/system/address/${id}/postcode`,
    country: _countries(address?.international?.country),
    pageTitle: 'Enter the international address',
    postcode: address?.international?.postcode ?? null
  }
}

function _countries(savedCountry) {
  const displayCountries = countries.map((country) => {
    return {
      value: country,
      selected: savedCountry === country,
      text: country
    }
  })

  displayCountries.unshift({
    value: 'select',
    selected: savedCountry !== 'select',
    text: 'Select a country'
  })

  return displayCountries
}

module.exports = {
  go
}
