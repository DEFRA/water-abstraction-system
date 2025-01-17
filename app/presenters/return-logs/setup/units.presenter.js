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
    pageTitle: 'Which units were used?',
    units: units ?? null,
    sessionId,
    returnReference,
    backLink: `/system/return-logs/setup/${sessionId}/reported`
  }
}

module.exports = {
  go
}
