'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/confirmation` page
 * @module ConfirmationPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/confirmation` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const {
    id: sessionId,
    data: { licenceId, licenceRef, underQuery, purposes, siteDescription, returnLogId }
  } = session

  return {
    sessionId,
    returnLog: {
      returnLogId,
      purposes,
      siteDescription
    },
    licenceRef,
    licenceId,
    pageTitle: underQuery ? 'Query recorded' : 'Query resolved'
  }
}

module.exports = {
  go
}
