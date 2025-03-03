'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/received` page
 * @module ReceivedPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

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
    backLink: _backLink(session),
    pageTitle: 'When was the return received?',
    receivedDateDay: receivedDateDay ?? null,
    receivedDateMonth: receivedDateMonth ?? null,
    receivedDateOption: receivedDateOptions ?? null,
    receivedDateYear: receivedDateYear ?? null,
    returnReference,
    sessionId,
    todaysDate: formatLongDate(new Date()),
    yesterdaysDate: _yesterdaysDate()
  }
}

function _backLink(session) {
  const { checkPageVisited, id, licenceId } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  return `/system/licences/${licenceId}/returns`
}

function _yesterdaysDate() {
  const yesterdaysDate = new Date()
  yesterdaysDate.setDate(yesterdaysDate.getDate() - 1)

  return formatLongDate(yesterdaysDate)
}

module.exports = {
  go
}
