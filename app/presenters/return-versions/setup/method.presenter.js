'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/method` page
 * @module MethodPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/method` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, licence, method } = session

  return {
    backLink: `/system/return-versions/setup/${sessionId}/reason`,
    displayCopyExisting: licence.returnVersions.length > 0,
    licenceRef: licence.licenceRef,
    method: method ?? null,
    pageTitle: 'How do you want to set up the requirements for returns?',
    sessionId
  }
}

module.exports = {
  go
}
