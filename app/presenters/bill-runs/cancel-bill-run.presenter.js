'use strict'

/**
 * Formats the bill run data ready for presenting in the cancel bill run confirmation page
 * @module CancelBillRunPresenter
 */

const {
  capitalize,
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
 * @returns {Object} - the prepared bill run data to be passed to the cancel bill run confirmation page
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
    backLink: _backLink(id, status),
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    region: capitalize(region.displayName)
  }
}

function _backLink (id, status) {
  if (status === 'review') {
    return `/system/bill-runs/${id}/review`
  }

  return `/system/bill-runs/${id}`
}

module.exports = {
  go
}
