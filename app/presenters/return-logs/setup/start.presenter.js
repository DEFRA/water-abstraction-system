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
 * @returns {object} page data needed for the `/return-log-edit/{sessionId}/start` page
 */
function go(session) {
  const {
    dueDate,
    endDate,
    licenceId,
    licenceRef,
    periodStartDay,
    periodStartMonth,
    periodEndDay,
    periodEndMonth,
    purposes,
    receivedDate,
    returnLogId,
    returnReference,
    siteDescription,
    startDate,
    status,
    twoPartTariff,
    journey
  } = session

  return {
    abstractionPeriod: `From ${formatAbstractionPeriod(
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )}`,
    displayRecordReceipt: receivedDate === null,
    licenceId,
    licenceRef,
    pageTitle: 'Abstraction return',
    purposes,
    returnLogId,
    returnsPeriod: `From ${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReference,
    selectedOption: journey ?? null,
    siteDescription,
    status: _status(status, dueDate),
    tariffType: twoPartTariff ? 'Two part tariff' : 'Standard tariff'
  }
}

function _status(status, dueDate) {
  // If the return is completed we are required to display it as 'complete'. This also takes priority over the other
  // statues
  if (status === 'completed') {
    return 'complete'
  }

  // Work out if the return is overdue (status is still 'due' and it is past the due date)
  const today = new Date()

  // The due date held in the record is date-only. If we compared it against 'today' without this step any return due
  // 'today' would be flagged as overdue when it is still due (just!)
  today.setHours(0, 0, 0, 0)

  if (status === 'due' && new Date(dueDate) < today) {
    return 'overdue'
  }

  // For all other cases we can just return the status and the return-status-tag macro will know how to display it
  return status
}

module.exports = {
  go
}
