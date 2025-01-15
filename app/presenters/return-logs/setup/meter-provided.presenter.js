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
  const {
    id: sessionId,
    data: { returnReference },
    meterProvided
  } = session

  return {
    backLink: `/system/return-logs/setup/${session.id}/units`,
    meterProvided: meterProvided ?? null,
    pageTitle: 'Have meter details been provided?',
    returnReference,
    sessionId
  }
}

module.exports = {
  go
}
