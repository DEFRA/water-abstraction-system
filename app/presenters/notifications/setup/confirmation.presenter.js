'use strict'

/**
 * Formats data for the `/notifications/setup/{sessionId}/confirmation` page
 * @module ConfirmationPresenter
 */

/**
 * Formats data for the `/notifications/setup/{sessionId}/confirmation` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { referenceCode, journey } = session

  return {
    backLink: `/manage`,
    forwardLink: '/notifications/report',
    pageTitle: `Returns ${journey} sent`,
    referenceCode
  }
}

module.exports = {
  go
}
