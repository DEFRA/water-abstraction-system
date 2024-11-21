'use strict'

/**
 * Formats the bill run data ready for presenting in the cancel bill run confirmation page
 * @module ViewCancelBillRunPresenter
 */

const {
  formatBillRunType,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate,
  titleCase
} = require('../base.presenter.js')

/**
 * Prepares and processes bill run data for presentation
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 *
 * @returns {object} - the prepared bill run data to be passed to the cancel bill run confirmation page
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
    backLink: _backLink(id, scheme, status),
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    region: titleCase(region.displayName)
  }
}

function _backLink (id, scheme, status) {
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
