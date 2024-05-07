'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/type` page
 * @module TypePresenter
 */

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/type` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  return {
    sessionId: session.id,
    selectedType: session.type ? session.type : null
  }
}

module.exports = {
  go
}
