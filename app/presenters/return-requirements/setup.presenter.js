'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/setup` page
 * @module SetupPresenter
 */

/**
 * Formats data for the `/return-requirements/{sessionId}/setup` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence, setup } = session

  return {
    backLink: `/system/return-requirements/${sessionId}/reason`,
    displayCopyExisting: licence.returnVersions.length > 0 && licence.hasPermitVersion,
    displayUseAbstractionData: licence.hasPermitVersion,
    licenceRef: licence.licenceRef,
    sessionId,
    setup: setup ?? null
  }
}

module.exports = {
  go
}
