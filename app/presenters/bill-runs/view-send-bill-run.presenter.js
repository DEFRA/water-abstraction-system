'use strict'

/**
 * Formats the bill run data ready for presenting in the send bill run confirmation page
 * @module ViewSendBillRunPresenter
 */

const { formatFinancialYear, formatLongDate, titleCase } = require('../base.presenter.js')
const { formatBillRunType, formatChargeScheme } = require('../billing.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {object} - the prepared bill run data to be passed to the send bill run confirmation page
 */
function go(billRun) {
  const { batchType, billRunNumber, createdAt, id, region, scheme, status, summer, toFinancialYearEnding } = billRun

  return {
    backLink: '/system/bill-runs/' + id,
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    pageTitle: "You're about to send this bill run",
    region: titleCase(region.displayName)
  }
}

module.exports = {
  go
}
