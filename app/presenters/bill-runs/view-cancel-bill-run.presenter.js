'use strict'

/**
 * Formats the bill run data ready for presenting in the cancel bill run confirmation page
 * @module ViewCancelBillRunPresenter
 */

const { formatFinancialYear, formatLongDate, titleCase } = require('../base.presenter.js')
const { formatBillRunType, formatChargeScheme } = require('../billing.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {object} - the prepared bill run data to be passed to the cancel bill run confirmation page
 */
function go(billRun) {
  const { batchType, billRunNumber, createdAt, id, region, scheme, status, summer, toFinancialYearEnding } = billRun

  return {
    backLink: _backLink(id, scheme, status),
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    pageTitle: "You're about to cancel this bill run",
    region: titleCase(region.displayName)
  }
}

function _backLink(id, scheme, status) {
  if (status === 'review') {
    if (scheme === 'alcs') {
      return `/billing/batch/${id}/two-part-tariff-review`
    }

    return `/system/bill-runs/review/${id}`
  }

  return `/system/bill-runs/${id}`
}

module.exports = {
  go
}
