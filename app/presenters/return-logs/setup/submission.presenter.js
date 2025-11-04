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
    backLink: { href: _backLinkHref(session), text: 'Back' },
    beenReceived,
    journey: journey ?? null,
    pageTitle: 'What do you want to do with this return?',
    pageTitleCaption: `Return reference ${returnReference}`
  }
}

function _backLinkHref(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  return `/system/return-logs/setup/${id}/received`
}

module.exports = {
  go
}
