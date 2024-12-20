'use strict'

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 * @module CheckReturnsPresenter
 */

/**
 * Formats data for the `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 *
 * @param {object} data - The session instance to format
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} - The data formatted for the view template
 */
function go(data, session) {
  return {
    licenceHolder: data.$licenceHolder(),
    sessionId: session.id,
    licenceRef: session.licenceRef,
    backLink: 'system/notifications/ad-hoc-returns/' + session.id + '/licence'
  }
}

module.exports = {
  go
}
