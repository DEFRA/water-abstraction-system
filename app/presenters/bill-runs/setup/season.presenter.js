'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/season` page
 * @module SeasonPresenter
 */

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/season` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  return {
    sessionId: session.id,
    selectedSeason: session.data.season ? session.data.season : null
  }
}

module.exports = {
  go
}
