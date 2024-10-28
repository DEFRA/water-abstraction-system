'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/reason` page
 * @module ReasonPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/reason` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence, reason } = session

  return {
    backLink: _backLink(session),
    licenceRef: licence.licenceRef,
    reason: reason ?? null,
    sessionId
  }
}

function _backLink (session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-versions/setup/${id}/check`
  }

  return `/system/return-versions/setup/${id}/start-date`
}

module.exports = {
  go
}
