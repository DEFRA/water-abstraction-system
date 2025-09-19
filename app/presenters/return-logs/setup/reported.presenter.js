'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/reported` page
 * @module ReportedPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/reported` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, returnReference, reported } = session

  return {
    backLink: { href: _backLink(session), text: 'Back' },
    pageTitle: 'How was this return reported?',
    pageTitleCaption: `Return reference ${returnReference}`,
    reported: reported ?? null,
    sessionId
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  return `/system/return-logs/setup/${id}/submission`
}

module.exports = {
  go
}
