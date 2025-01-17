'use strict'

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/licence` page
 * @module LicencePresenter
 */

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/licence` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    sessionId: session.id,
    licenceRef: session.licenceRef ?? null,
    pageTitle: 'Enter a licence number'
  }
}

module.exports = {
  go
}
