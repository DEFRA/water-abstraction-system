'use strict'

/**
 * Formats the data ready for presenting in the abstraction return page
 * @module EditReturnLogPresenter
 */

const { formatAbstractionPeriod, formatLongDate } = require('../base.presenter.js')

/**
 * Formats the data ready for presenting in the abstraction return page
 *
 * @param {module:ReturnLogModel} editReturnLog - instance of the `ReturnLogModel` returned from
 * `FetchEditReturnLogService`
 *
 * @returns {object} page date needed for the abstraction return page
 */
function go(editReturnLog) {
  const {
    endDate,
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
  } = editReturnLog

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
    purposes: _formatPurposes(purposes),
    queryText: underQuery ? 'Resolve query' : 'Record under query',
    returnLogId,
    returnsPeriod: `From ${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    returnReference,
    siteDescription,
    tariffType: twoPartTariff ? 'Two part tariff' : 'Standard tariff'
  }
}

/**
 * Format the purposes for a return log
 *
 * It is possible that a return log has more than one purpose associated it. If this is the case we need the description
 * of each purpose from the array of purposes to be concatenated into a single comma separated string ready to present.
 *
 * @param {Array} purposes - the purposes taken from the return logs metadata
 *
 * @returns {string} the purpose descriptions as a string, separated by commas if more than one description exists
 */
function _formatPurposes(purposes) {
  const purposeDescriptionArray = purposes.map((purpose) => {
    return purpose.tertiary.description
  })

  return purposeDescriptionArray.join(', ')
}

module.exports = {
  go
}
