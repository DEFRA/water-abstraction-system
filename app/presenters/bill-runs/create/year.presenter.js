'use strict'

/**
 * Formats data for the `/bill-runs/create/{sessionId}/year` page
 * @module RegionPresenter
 */

/**
 * Formats data for the `/bill-runs/create/{sessionId}/year` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  return {
    id: session.id,
    selectedYear: session.data.year
  }
}

module.exports = {
  go
}
