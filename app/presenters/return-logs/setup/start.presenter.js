'use strict'

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/start` page
 * @module StartPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../../base.presenter.js')

/**
 * Formats the data ready for presenting in the `/return-logs/setup/{sessionId}/start` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-logs/setup/{sessionId}/start` page
 */
function go(session) {
  const {
    beenReceived,
    dueDate,
    endDate,
    journey,
    licenceId,
    licenceRef,
    periodStartDay,
    periodStartMonth,
    periodEndDay,
    periodEndMonth,
    purposes,
    returnReference,
    siteDescription,
    startDate,
    status,
    twoPartTariff
  } = session

  return {
    abstractionPeriod: `From ${formatAbstractionPeriod(
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )}`,
    beenReceived,
    journey: journey ?? null,
    licenceId,
    licenceRef,
    pageTitle: 'Abstraction return',
    purposes,
    returnsPeriod: `From ${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReference,
    siteDescription,
    status: _status(status, dueDate),
    tariffType: twoPartTariff ? 'Two part tariff' : 'Standard tariff'
  }
}

function _status(status, dueDate) {
  if (status === 'due') {
    // Work out if the return is overdue (status is still 'due' and it is past the due date)
    const today = new Date()
    // Reset today's time to midnight to ensure only the date is compared
    today.setHours(0, 0, 0, 0)

    if (new Date(dueDate) < today) {
      return 'overdue'
    }
  }

  // For all other cases we can just return the status and the return-status-tag macro will know how to display it
  // return status
  return status
}

module.exports = {
  go
}
