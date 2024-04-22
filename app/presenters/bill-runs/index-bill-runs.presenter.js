'use strict'

/**
 * Formats the summary data for each bill run for use in the /bill-runs page
 * @module IndexBillRunsPresenter
 */

const {
  capitalize,
  formatBillRunType,
  formatLongDate,
  formatMoney
} = require('../base.presenter.js')

/**
 * Formats the summary data for each bill run for use in the /bill-runs page
 *
 * @param {module:BillRunModel[]} billRuns - The bill runs containing the data to be summarised for the view
 *
 * @returns {Object[]} Each bill run summary formatted for use in the `index.njk` template for `/bill-runs`
 */
function go (billRuns) {
  return billRuns.map((billRun) => {
    const {
      batchType,
      billRunNumber,
      createdAt,
      id,
      netTotal,
      numberOfBills,
      region,
      scheme,
      summer,
      status
    } = billRun

    const type = formatBillRunType(batchType, scheme, summer)

    return {
      id,
      createdAt: formatLongDate(createdAt),
      link: _link(id, status),
      number: billRunNumber,
      numberOfBills,
      region: capitalize(region),
      scheme,
      status,
      total: formatMoney(netTotal, true),
      type
    }
  })
}

function _link (billRunId, status) {
  if (status === 'review') {
    return `/system/bill-runs/${billRunId}/review`
  }

  return `/system/bill-runs/${billRunId}`
}

module.exports = {
  go
}
