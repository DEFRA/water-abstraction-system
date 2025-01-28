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
    licenceId,
    returnReference,
    receivedDateOptions,
    receivedDateDay,
    receivedDateMonth,
    receivedDateYear
  } = session

  return {
    backLink: `/system/licences/${licenceId}/returns`,
    pageTitle: 'When was the return received?',
    receivedDateDay: receivedDateDay ?? null,
    receivedDateMonth: receivedDateMonth ?? null,
    receivedDateOption: receivedDateOptions ?? null,
    receivedDateYear: receivedDateYear ?? null,
    returnReference,
    sessionId
  }
}

module.exports = {
  go
}
