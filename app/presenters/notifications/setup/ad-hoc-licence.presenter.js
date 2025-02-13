'use strict'

/**
 * Formats data for the `/notifications/setup/{sessionId}/ad-hoc-licence` page
 * @module AdHocLicencePresenter
 */

/**
 * Formats data for the `/notifications/setup/{sessionId}/ad-hoc-licence` page
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
