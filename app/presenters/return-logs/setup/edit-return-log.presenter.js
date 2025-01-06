'use strict'

/**
 * Formats the data ready for presenting in the abstraction return page
 * @module EditReturnLogPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../../base.presenter.js')

/**
 * Formats the data ready for presenting in the abstraction return page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} page date needed for the abstraction return page
 */
function go(session) {
  const {
    endDate,
    howToEdit,
    licenceId,
    licenceRef,
    periodStartDay,
    periodStartMonth,
    periodEndDay,
    periodEndMonth,
    purposes,
    returnLogId,
    returnReference,
    siteDescription,
    startDate,
    twoPartTariff,
    underQuery
  } = session

  return {
    abstractionPeriod: `From ${formatAbstractionPeriod(
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth
    )}`,
    licenceId,
    licenceRef,
    pageTitle: 'Abstraction return',
    purposes,
    queryText: underQuery ? 'Resolve query' : 'Record under query',
    returnLogId,
    returnsPeriod: `From ${formatLongDate(new Date(startDate))} to ${formatLongDate(new Date(endDate))}`,
    returnReference,
    selectedOption: howToEdit ?? howToEdit,
    siteDescription,
    tariffType: twoPartTariff ? 'Two part tariff' : 'Standard tariff'
  }
}

module.exports = {
  go
}
