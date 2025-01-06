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
    licence: { id: licenceId, licenceRef },
    underQuery,
    purposes,
    description,
    returnLogId
  } = session

  return {
    sessionId,
    returnLog: {
      returnLogId,
      purpose: purposes[0].tertiary.description,
      siteDescription: description
    },
    licenceRef,
    licenceId,
    pageTitle: underQuery ? 'Query recorded' : 'Query resolved'
  }
}

module.exports = {
  go
}
