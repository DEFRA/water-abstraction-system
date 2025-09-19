'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/start-reading` page
 * @module StartReadingPresenter
 */

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/start-reading` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/start-reading` page
 */
function go(session) {
  const { id: sessionId, returnReference, startReading } = session

  return {
    backLink: { href: _backLink(session), text: 'Back' },
    pageTitle: 'Enter the start meter reading',
    pageTitleCaption: `Return reference ${returnReference}`,
    sessionId,
    startReading: _savedValue(startReading)
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  return `/system/return-logs/setup/${id}/reported`
}

function _savedValue(startReading) {
  if (startReading === 0) {
    return '0'
  }

  return startReading ?? null
}

module.exports = {
  go
}
