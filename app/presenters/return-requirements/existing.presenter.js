'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/existing` page
 * @module ExistingPresenter
 */

/**
 * Formats data for the `/return-requirements/{sessionId}/existing` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Object} The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence } = session

  return {
    licenceRef: licence.licenceRef,
    sessionId
  }
}

module.exports = {
  go
}
