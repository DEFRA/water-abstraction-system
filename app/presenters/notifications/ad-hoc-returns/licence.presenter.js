'use strict'

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/licence` page
 * @module LicencePresenter
 */

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/licence` page
 *
 * @param {string} licenceRef
 *
 * @returns {object} - The data formatted for the view template
 */
function go(licenceRef) {
  return {
    licenceRef: licenceRef || null,
    pageTitle: 'Enter a licence number'
  }
}

module.exports = {
  go
}
