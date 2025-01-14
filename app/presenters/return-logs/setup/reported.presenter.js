'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/reported` page
 * @module ReportedPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/reported` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const {
    id: sessionId,
    data: { returnReference },
    reported
  } = session

  return {
    pageTitle: 'How was this return reported?',
    reported: reported ?? null,
    sessionId,
    returnReference,
    backLink: `/system/return-logs/setup/${session.id}/received`
  }
}

module.exports = {
  go
}
