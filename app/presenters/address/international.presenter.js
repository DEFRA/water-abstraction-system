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
    addressLine1: address?.addressLine1 ?? null,
    addressLine2: address?.addressLine2 ?? null,
    addressLine3: address?.addressLine3 ?? null,
    addressLine4: address?.addressLine4 ?? null,
    backLink: `/system/address/${id}/postcode`,
    country: _countries(address?.country),
    pageTitle: 'Enter the international address',
    postcode: address?.postcode ?? null
  }
}

function _countries(value = 'select') {
  const displayCountries = countries.map((country) => {
    return {
      value: country,
      selected: value === country,
      text: country
    }
  })

  displayCountries.unshift({
    value: 'select',
    selected: value === 'select',
    text: 'Select a country'
  })

  return displayCountries
}

module.exports = {
  go
}
