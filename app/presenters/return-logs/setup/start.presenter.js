'use strict'

/**
 * Formats the data ready for presenting in the `/return-log-edit/{sessionId}/start` page
 * @module EditReturnLogPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../../base.presenter.js')

/**
 * Formats the data ready for presenting in the `/return-log-edit/{sessionId}/start` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page data needed for the `/return-log-edit/{sessionId}/start` page
 */
function go(session) {
  const {
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
    underQuery,
    whatToDo
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
    queryText: underQuery ? 'Resolve query' : 'Record under query',
    returnLogId,
    returnsPeriod: `From ${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReference,
    selectedOption: whatToDo ?? whatToDo,
    siteDescription,
    status,
    tariffType: twoPartTariff ? 'Two part tariff' : 'Standard tariff'
  }
}

module.exports = {
  go
}
