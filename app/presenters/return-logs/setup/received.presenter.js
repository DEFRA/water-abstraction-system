'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/received` page
 * @module ReceivedPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/received` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const {
    id: sessionId,
    returnReference,
    receivedDateOptions,
    receivedDateDay,
    receivedDateMonth,
    receivedDateYear
  } = session

  return {
    pageTitle: 'When was the return received?',
    receivedDateOption: receivedDateOptions ?? null,
    receivedDateDay: receivedDateDay ?? null,
    receivedDateMonth: receivedDateMonth ?? null,
    receivedDateYear: receivedDateYear ?? null,
    sessionId,
    returnReference,
    backLink: `/system/return-logs/setup/${sessionId}/start`
  }
}

module.exports = {
  go
}
