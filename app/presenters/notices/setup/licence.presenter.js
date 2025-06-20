'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/licence` page
 * @module LicencePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/licence` page
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
