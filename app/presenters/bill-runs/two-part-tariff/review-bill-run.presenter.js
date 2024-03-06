'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module ReviewBillRunPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and licence data for presentation
 *
 * @param {module:BillRunModel} billRun the data from the bill run
 * @param {module:LicenceModel} licences the licences data asociated with the bill run
 *
 * @returns {Object} the prepared bill run and licence data to be passed to the review page
 */
function go (billRun, _licences) {
  const preparedBillRun = _prepareBillRun(billRun)

  return { ...preparedBillRun }
}

function _prepareBillRun (billRun) {
  return {
    region: billRun.region.displayName,
    status: billRun.status,
    dateCreated: formatLongDate(billRun.createdAt),
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    billRunType: 'two-part tariff'
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
