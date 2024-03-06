'use strict'

/**
 * Formats data for the `/bill-runs/create/{sessionId}/type` page
 * @module TypePresenter
 */

/**
 * Formats data for the `/bill-runs/create/{sessionId}/type` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  return {
    id: session.id,
    selectedType: session.data.type
  }
}

module.exports = {
  go
}
