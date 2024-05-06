'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 * @module RegionPresenter
 */

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  return {
    sessionId: session.id,
    selectedYear: session.year ? session.year : null
  }
}

module.exports = {
  go
}
