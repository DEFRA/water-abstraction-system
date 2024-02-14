'use strict'

/**
 * Formats the bill run data ready for presenting in the cancel bill run confirmation page
 * @module CancelBillRunConfirmationPresenter
 */

const { formatLongDate } = require('../base.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun the data from the bill run
 *
 * @returns {Object} the prepared bill run data to be passed to the cancel bill run confirmation page
 */
function go (billRun) {
  return {
    dateCreated: formatLongDate(billRun.createdAt),
    region: billRun.region.displayName,
    billRunType: billRun.batchType === 'two_part_tariff' ? 'two-part tariff' : billRun.batchType,
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    billRunBatchType: billRun.batchType
  }
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

module.exports = {
  go
}
