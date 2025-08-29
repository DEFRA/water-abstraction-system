'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/submission` page
 * @module SubmissionPresenter
 */

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/submission` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/submission` page
 */
function go(session) {
  const { beenReceived, journey, returnReference } = session

  return {
    backLink: _backLink(session),
    beenReceived,
    caption: `Return reference ${returnReference}`,
    journey: journey ?? null,
    pageTitle: 'What do you want to do with this return?'
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  return `/system/return-logs/setup/${id}/received`
}

module.exports = {
  go
}
