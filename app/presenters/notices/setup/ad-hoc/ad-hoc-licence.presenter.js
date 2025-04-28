'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/ad-hoc-licence` page
 * @module AdHocLicencePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/ad-hoc-licence` page
 *
 * @param {string} licenceRef
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {object} - The data formatted for the view template
 */
function go(licenceRef, referenceCode) {
  return {
    licenceRef: licenceRef || null,
    pageTitle: 'Enter a licence number',
    referenceCode
  }
}

module.exports = {
  go
}
