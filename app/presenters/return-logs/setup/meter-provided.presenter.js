'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/meter-provided` page
 * @module MeterProvidedPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/meter-provided` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, returnReference, meterProvided } = session

  return {
    backLink: _backLink(session),
    meterProvided: meterProvided ?? null,
    pageTitle: 'Have meter details been provided?',
    returnReference,
    sessionId
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  return `/system/return-logs/setup/${id}/units`
}

module.exports = {
  go
}
