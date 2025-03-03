'use strict'

/**
 * Formats the bill run data ready for presenting in the empty bill run page
 * @module EmptyBillRunPresenter
 */

const { formatFinancialYear, formatLongDate, titleCase } = require('../base.presenter.js')
const { formatBillRunType, formatChargeScheme, generateBillRunTitle } = require('../billing.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {object} - the prepared bill run data to be passed to the empty bill run page
 */
function go(billRun) {
  const { batchType, billRunNumber, createdAt, id, region, scheme, status, summer, toFinancialYearEnding } = billRun

  return {
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    pageTitle: generateBillRunTitle(region.displayName, batchType, scheme, summer),
    region: titleCase(region.displayName)
  }
}

module.exports = {
  go
}
