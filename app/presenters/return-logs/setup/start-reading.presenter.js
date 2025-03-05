'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/start-reading` page
 * @module StartReadingPresenter
 */

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/start-reading` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 */
function go(session) {
  const { id: sessionId, returnReference, startReading } = session

  return {
    backLink: `/system/return-logs/setup/${sessionId}/check`,
    pageTitle: 'Enter the start meter reading',
    returnReference,
    sessionId,
    startReading: startReading ?? null
  }
}

module.exports = {
  go
}
