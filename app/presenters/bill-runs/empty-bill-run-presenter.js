'use strict'

/**
 * Formats the bill run data ready for presenting in the empty bill run page
 * @module EmptyBillRunPresenter
 */

const {
  capitalize,
  generateBillRunTitle,
  formatBillRunType,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate
} = require('../base.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {Object} - the prepared bill run data to be passed to the empty bill run page
 */
function go (billRun) {
  const {
    batchType,
    billRunNumber,
    createdAt,
    id,
    region,
    scheme,
    status,
    summer,
    toFinancialYearEnding
  } = billRun

  return {
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    pageTitle: generateBillRunTitle(region.displayName, batchType, scheme, summer),
    region: capitalize(region.displayName)
  }
}

module.exports = {
  go
}
