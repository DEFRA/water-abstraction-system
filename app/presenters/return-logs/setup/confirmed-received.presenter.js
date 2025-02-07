'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/confirmed-received` page
 * @module ConfirmedReceivedPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/confirmed-received` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, licenceId, licenceRef, purposes, returnReference, siteDescription } = session

  return {
    backLink: `/system/licences/${licenceId}/returns`,
    licenceRef,
    pageTitle: `Return ${returnReference} received`,
    purposes,
    sessionId,
    siteDescription
  }
}

module.exports = {
  go
}
