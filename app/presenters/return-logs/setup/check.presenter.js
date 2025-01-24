'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/check` page
 */
function go(session) {
  const { id: sessionId, returnReference } = session

  return {
    pageTitle: 'Check details and enter new volumes or readings',
    returnReference,
    sessionId
  }
}

module.exports = {
  go
}
