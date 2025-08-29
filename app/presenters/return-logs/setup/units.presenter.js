'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/units` page
 * @module UnitsPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/units` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, returnReference, units } = session

  return {
    backLink: _backLink(session),
    caption: `Return reference ${returnReference}`,
    pageTitle: 'Which units were used?',
    sessionId,
    units: units ?? null
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  if (session.reported === 'meter-readings') {
    return `/system/return-logs/setup/${id}/start-reading`
  }

  return `/system/return-logs/setup/${id}/reported`
}

module.exports = {
  go
}
