'use strict'

/**
 * Formats data for the `/bill-runs/create/{sessionId}/season` page
 * @module SeasonPresenter
 */

/**
 * Formats data for the `/bill-runs/create/{sessionId}/season` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  return {
    id: session.id,
    selectedSeason: session.data.season
  }
}

module.exports = {
  go
}
