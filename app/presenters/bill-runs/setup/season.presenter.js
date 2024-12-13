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
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    pageTitle: 'Select the season',
    sessionId: session.id,
    selectedSeason: session.season ? session.season : null
  }
}

module.exports = {
  go
}
